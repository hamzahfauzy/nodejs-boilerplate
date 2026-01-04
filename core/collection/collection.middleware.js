import { getCollection } from "./collection.registry.js"
export function collectionMiddleware(){
    return async (req, res, next) => {
        const collection = getCollection(req.params.collection)
        if(!collection)
        {
            res.status(404).json({
                message: 'Collection not found'
            })

            return
        }

        req.collection = collection

        next()

    }
}

export function collectionPermission(permissionKey){

    return async (req, res, next) => {
        const key = req.collection.name + '.' + permissionKey
        if (!req.collection.permissions.includes(key) || !req.user.permissions.includes(key)) {
            res.status(403).json({
                message: 'Unauthorized'
            })
            return
        }

        next()
    }
}