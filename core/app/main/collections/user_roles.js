import mongoose from "mongoose"
const userRoles = {
    name: 'user_roles',
    schema: {
        fields: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
        },
        options: {
            timestamps: true
        }
    },
    permissions: []
}

export default userRoles