// core/auth/auth.service.js
import jwt from 'jsonwebtoken'
import { hashPassword, comparePassword } from './password.util.js'
import { getCollection } from '#collection/collection.registry.js'
import CollectionService from '#collection/collection.service.js'

export async function register({ username, password }) {
  const User = getCollection('users')
  const exists = await User.model.findOne({ username })
  if (exists) throw new Error('Username already registered')

  const user = await User.model.create({
    username,
    password: await hashPassword(password)
  })

  return user
}

export async function login({ username, password }) {
  const User = getCollection('users')
  const user = await User.model.findOne({ username, isActive: 1 })
  if (!user) throw new Error('Login error: Invalid username or password')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw new Error('Login error: Invalid username or password')

  const token = jwt.sign(
    {
      userId: user._id.toString()
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username
    }
  }
}

export async function updateProfile(_id, payload) {
  const User = await getCollection('users')
  const UserRoleCollection = await getCollection('user_roles')
  if(payload.password)
  {
    payload.password = await hashPassword(payload.password)
  }
  const updated = await (new CollectionService).update(User, _id, payload)

  const result = await UserRoleCollection.model.aggregate([
      // 1️⃣ filter user
      {
          $match: {
              userId: updated._id
          }
      },

      // 2️⃣ join role_permissions
      {
          $lookup: {
              from: 'role_permissions',
              localField: 'roleId',
              foreignField: 'roleId',
              as: 'role_permissions'
          }
      },
      { $unwind: '$role_permissions' },

      // 3️⃣ join permissions
      {
          $lookup: {
              from: 'permissions',
              localField: 'role_permissions.permissionId',
              foreignField: '_id',
              as: 'permission'
          }
      },
      { $unwind: '$permission' },

      // 4️⃣ kumpulkan permission.key
      {
          $group: {
              _id: '$userId',
              permissions: { $addToSet: '$permission.key' }
          }
      },

      // 5️⃣ rapikan output
      {
          $project: {
              _id: 0,
              permissions: 1
          }
      }
  ])

  updated.permissions = result[0]?.permissions || []

  return updated
}