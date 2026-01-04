import mongoose from "mongoose"
const userRoles = {
    name: 'user_roles',
    schema: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
    },
    permissions: []
}

export default userRoles