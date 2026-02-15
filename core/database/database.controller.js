import DatabaseService from "./database.service.js"
export default function DatabaseController() {
    const service = new DatabaseService()

    return {
        columns(req, res){
            const data = service.getColumn(req.table)
            res.json({
                data,
                message: 'columns retrieved'
            })
        },
        async list(req, res){
            const queryParam = await runHook(req.table, 'queryList', {
                req
            }) ?? req.query

            let data = []

            if(queryParam.draw)
            {
                data = await service.datatable(req.table, queryParam)
            }
            else
            {
                const limit = queryParam.nolimit ? false : (queryParam.limit ?? 20)
                data = await service.list(req.table, queryParam, limit)
            }

            const hookData = await runHook(req.table, 'listData', {
                req,
                data
            })

            if(hookData)
            {
                data = hookData.data
            }

            res.json(data)
        },
        async single(req, res){
            let data = await service.single(req.table, req.params.id)

            const hookData = await runHook(req.collection, 'singleData', {
                req,
                data
            })

            if(hookData)
            {
                data = hookData.data
            }

            res.json({
                data,
                message: 'single data retrieved'
            })
        },
        async create(req, res){
            let payload = req.body

            // BEFORE CREATE
            const before = await runHook(req.table, 'beforeCreate', {
                req,
                payload
            })

            if (before?.abort) {
                return res.status(400).json({ 
                    message: before.message,
                    errors: before.errors ?? []
                })
            }

            if (before) payload = before.payload

            const data = await service.create(req.table, payload)

            // AFTER CREATE
            await runHook(req.table, 'afterCreate', {
                req,
                data
            })

            res.json({
                data,
                message: 'data created'
            })
        },
        async update(req, res){

            let payload = req.body

            // BEFORE UPDATE
            const before = await runHook(req.table, 'beforeUpdate', {
                req,
                payload
            })

            if (before?.abort) {
                return res.status(400).json({ 
                    message: before.message,
                    errors: before.errors ?? []
                })
            }

            if (before) payload = before.payload

            const data = await service.update(req.table, req.params.id, payload)

            // AFTER UPDATE
            await runHook(req.table, 'afterUpdate', {
                req,
                data
            })

            res.json({
                data,
                message: 'data updated'
            })
        },
        async remove(req, res){
            const row = await service.single(req.table, req.params.id)

            // BEFORE UPDATE
            const before = await runHook(req.table, 'beforeRemove', {
                req,
                row
            })

            if (before?.abort) {
                return res.status(400).json({ 
                    message: before.message,
                    errors: before.errors ?? []
                })
            }

            const data = await service.delete(req.table, req.params.id)

            // AFTER CREATE
            await runHook(req.collection, 'afterRemove', {
                req,
                row
            })

            res.json({
                data,
                message: 'data removed'
            })
        }
    }

    async function runHook(config, hookName, context = {}) {
        const hook = config?.hooks?.[hookName]

        if (typeof hook !== 'function') {
            return null
        }

        return await hook(context)
    }
}