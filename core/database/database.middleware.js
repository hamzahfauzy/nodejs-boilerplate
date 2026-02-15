import { getTable } from "./database.registry.js"
export function databaseMiddleware(){
    return async (req, res, next) => {
        const table = getTable(req.params.table)
        if(!table)
        {
            res.status(404).json({
                message: 'Table not found'
            })

            return
        }

        req.table = table

        next()

    }
}

export function databasePermission(permissionKey){

    return async (req, res, next) => {
        const key = req.table.name + '.' + permissionKey
        if (!req.table.permissions.includes(key) || !req.user.permissions.includes(key)) {
            res.status(403).json({
                message: 'Unauthorized'
            })
            return
        }

        next()
    }
}