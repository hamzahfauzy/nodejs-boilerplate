import { getCollection } from "#collection/collection.registry.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import CollectionService from "#collection/collection.service.js" 

export async function authMiddleware(req, res, next){
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const UserCollection = getCollection('users')
        const UserRoleCollection = getCollection('user_roles')

        const user = await (new CollectionService).single(UserCollection, payload.userId)
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid user' })
        }

        const userId = new mongoose.Types.ObjectId(payload.userId)

        const result = await UserRoleCollection.model.aggregate([
            // 1️⃣ filter user
            {
                $match: {
                    userId: userId
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

        user.permissions = result[0]?.permissions || []
        // 🔥 INI YANG KAMU CARI
        // req.user = {user, permissions}
        req.user = user

        next()
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: 'Invalid token' })
    }
}

export async function logMiddleware(req, res, next){
    // hanya log user yang login
    if (!req.user) return next();
    if(
        req.originalUrl.includes('/collection/log_activities') ||
        req.originalUrl.includes('/ui/bootstrap')
    ) return next();

    // simpan response body juga (opsional)
    const oldSend = res.send;
    const LogActivity = getCollection('log_activities');
    let responseBody;

    res.send = function (body) {
        responseBody = body;
        return oldSend.call(this, body);
    };

    res.on('finish', async () => {
        try {
            await LogActivity.model.create({
                user: req.user,
                method: req.method,
                url: req.originalUrl,
                request_data: {
                    params: req.params,
                    query: req.query,
                    body: req.body
                },
                new_data: responseBody,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            });
        } catch (err) {
            console.error('Activity log failed:', err.message);
        }
    });

    next();
}