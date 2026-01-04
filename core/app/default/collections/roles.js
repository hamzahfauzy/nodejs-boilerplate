import { getCollection } from "#collection/collection.registry.js"
import { validateOrAbort } from "#validation/index.js"

const responseFields = {
    _id: {},
    name: {searchable: true},
    permissions: {
        pivot: {
            model: 'role_permissions',     // pivot collection
            localKey: 'roleId',      // FK ke parent
            foreignKey: 'permissionId',    // FK ke target
            target: 'permissions',         // target collection
            select: ['_id', 'key']
        }
    },
}

const roles = {
    name: 'roles',
    schema: {
        name: { type: String, unique: true }
    },
    permissions: ['roles.list','roles.single','roles.create','roles.update','roles.delete'],
    response: {
        list: responseFields,
        single: responseFields
    },
    hooks: {
        beforeCreate: async context => {
            const payload = {...context.payload}

            if(payload.permissions)
            {
                delete payload.permissions
            }

            const validate = await validateOrAbort(payload, {
                name: ['required', { name: 'min', value: 3 }],
            })

            if(validate.abort) return validate

            return validate
        },
        afterCreate: async context => {
            if(context.req.body.permissions)
            {
                const RolePermission = getCollection('role_permissions')
                const role  = context.data
                const toInsert = context.req.body.permissions.map(permission => ({
                    permissionId: permission,
                    roleId: role._id
                }))
                await RolePermission.model.insertMany(toInsert)
            }
        },
        beforeUpdate: async context => {
            const payload = context.payload

            if(payload.permissionIds)
            {
                const RolePermission = getCollection('role_permissions')
                const roleId = context.req.params.id
                const toInsert = context.req.body.permissionIds.map(permission => ({
                    roleId,
                    permissionId: permission
                }))

                await RolePermission.model.deleteMany({
                    roleId
                })
                await RolePermission.model.insertMany(toInsert)
                
                delete payload.permissionIds
            }

            const validate = await validateOrAbort(payload, {
                name: ['required', { name: 'min', value: 3 }],
            })

            if(validate.abort) return validate

            return validate
        }
    }
}

export default roles