import mongoose from "mongoose"
const userRoles = {
    name: 'role_permissions',
    schema: {
        fields: {
            roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
            permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'permissions' },
        },
        options: {
            timestamps: true
        }
    },
    permissions: []
}

export default userRoles