// core/auth/auth.service.js
import jwt from 'jsonwebtoken'
import { hashPassword, comparePassword } from './password.util.js'
import { getCollection } from '#collection/collection.registry.js'

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
  const user = await User.model.findOne({ username })
  if (!user) throw new Error('Invalid credentials')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

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
