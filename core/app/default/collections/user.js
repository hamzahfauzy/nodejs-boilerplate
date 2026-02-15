import { validateOrAbort } from "#validation/index.js"
import { hashPassword } from "#app/password.util.js"
import { getCollection } from "#collection/collection.registry.js"

const responseFields = {
    _id: {},
    name: {searchable: true},
    username: {searchable: true},
    pic_url: {},
    roles: {
        pivot: {
            model: 'user_roles',     // pivot collection
            localKey: 'userId',      // FK ke parent
            foreignKey: 'roleId',    // FK ke target
            target: 'roles',         // target collection
            select: ['_id', 'name']
        }
    },
    permissions: {
        pivot: {
            model: 'user_roles',
            localKey: 'userId',
            foreignKey: 'roleId',
            target: 'roles',
            through: {
                model: 'role_permissions',
                localKey: 'roleId',
                foreignKey: 'permissionId',
                target: 'permissions',
                select: ['_id', 'key']
            }
        }
    },
    isActive: {},
    createdAt: {},
    updatedAt: {},
}

const users = {
    name: 'users',
    schema: {
        fields: {
            name: { type: String },
            username: { type: String, unique: true },
            password: String,
            isActive: { type: String, default: "1" },
            pic_url: String,
        },
        options: {
            timestamps: true
        }
    },
    permissions: ['users.list','users.single','users.create','users.update','users.delete'],
    response: {
        list: responseFields,
        single: responseFields
    },
    hooks: {
        beforeCreate: async context => {
            const payload = {...context.payload}

            if(payload.roles)
            {
                delete payload.roles
            }

            const validate = await validateOrAbort(payload, {
                name: ['required', { name: 'min', value: 3 }],
                username: ['required', { name: 'min', value: 3 }],
                password: ['required', { name: 'min', value: 8 }],
                isActive: ['required']
            })

            if(validate.abort) return validate

            validate.payload.password = await hashPassword(payload.password)

            return validate
        },
        afterCreate: async context => {
            if(context.req.body.roles)
            {
                const UserRole = getCollection('user_roles')
                const user  = context.data
                const toInsert = context.req.body.roles.map(role => ({
                    userId: user._id,
                    roleId: role
                }))
                await UserRole.model.insertMany(toInsert)
            }
        },
        beforeUpdate: async context => {
            const payload = context.payload

            if(payload.roleIds)
            {
                const UserRole = getCollection('user_roles')
                const userId = context.req.params.id
                const toInsert = context.req.body.roleIds.map(role => ({
                    userId,
                    roleId: role
                }))

                await UserRole.model.deleteMany({
                    userId
                })
                await UserRole.model.insertMany(toInsert)

                delete payload.roleIds
            }

            const validate = await validateOrAbort(payload, {
                name: ['required', { name: 'min', value: 3 }],
                username: ['required', { name: 'min', value: 3 }],
                password: ['nullable', { name: 'min', value: 8 }],
                isActive: ['required']
            })

            if(validate.abort) return validate

            if(payload.password)
            {
                validate.payload.password = await hashPassword(payload.password)
            }

            return validate
        }
    }
}

export default users