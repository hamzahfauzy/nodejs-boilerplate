import mongoose from "mongoose"
const userRoles = {
    name: 'role_permissions',
    schema: {
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
        permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'permissions' },
    },
    permissions: []
}

export default userRoles