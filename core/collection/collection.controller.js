import CollectionService from "./collection.service.js"
export default function collectionController() {
    const service = new CollectionService()

    return {
        columns(req, res){
            const data = service.getColumn(req.collection)
            res.json({
                data,
                message: 'columns retrieved'
            })
        },
        async list(req, res){
            if(req.query.draw)
            {
                const data = await service.datatable(req.collection, req.query)
                res.json(data)
            }
            else
            {
                const limit = req.query.limit ?? 20
                const data = await service.list(req.collection, req.query, limit)
                res.json(data)
            }
        },
        async single(req, res){
            const data = await service.single(req.collection, req.params.id)
            res.json({
                data,
                message: 'single data retrieved'
            })
        },
        async create(req, res){
            let payload = req.body

            // BEFORE CREATE
            const before = await runHook(req.collection, 'beforeCreate', {
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

            const data = await service.create(req.collection, payload)

            // AFTER CREATE
            await runHook(req.collection, 'afterCreate', {
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
            const before = await runHook(req.collection, 'beforeUpdate', {
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

            const data = await service.update(req.collection, req.params.id, payload)

            // AFTER UPDATE
            await runHook(req.collection, 'afterUpdate', {
                req,
                data
            })

            res.json({
                data,
                message: 'data updated'
            })
        },
        async remove(req, res){
            const row = await service.single(req.collection, req.params.id)

            // BEFORE UPDATE
            const before = await runHook(req.collection, 'beforeRemove', {
                req,
                row
            })

            if (before?.abort) {
                return res.status(400).json({ 
                    message: before.message,
                    errors: before.errors ?? []
                })
            }

            const data = await service.delete(req.collection, req.params.id)

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