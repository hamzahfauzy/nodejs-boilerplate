import DatabaseService from "./database.service.js"
import { validateOrAbort } from "#validation/index.js"

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

            const hookData = await runHook(req.table, 'singleData', {
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

            if(req.table.validation?.create)
            {
                const validate = await validateOrAbort(payload, req.table.validation.create)
    
                if(validate.abort)
                {
                    return res.status(400).json({ 
                        message: validate.message,
                        errors: validate.errors ?? []
                    })
                }
            }

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

            try {
                const data = await service.create(req.table, payload)
    
                // AFTER CREATE
                await runHook(req.table, 'afterCreate', {
                    req,
                    data
                })
    
                return res.json({
                    data,
                    message: 'data created'
                })
                
            } catch (error) {
                return res.status(400).json({ 
                    message: 'Create Error',
                    errors: error.message ? [error.message] : []
                })
            }

        },
        async update(req, res){

            let payload = req.body

            if(req.table.validation?.update)
            {
                const validate = await validateOrAbort(payload, req.table.validation.update)

                if(validate.abort)
                {
                    return res.status(400).json({ 
                        message: validate.message,
                        errors: validate.errors ?? []
                    })
                }
            }

            const oldData = await service.single(req.table, req.params.id)

            // BEFORE UPDATE
            const before = await runHook(req.table, 'beforeUpdate', {
                req,
                payload,
                oldData
            })

            if (before?.abort) {
                return res.status(400).json({ 
                    message: before.message,
                    errors: before.errors ?? []
                })
            }

            if (before) payload = before.payload

            try {
                const data = await service.update(req.table, req.params.id, payload)

                // AFTER UPDATE
                await runHook(req.table, 'afterUpdate', {
                    req,
                    data,
                    oldData
                })

                return res.json({
                    data,
                    message: 'data updated'
                })
                
            } catch (error) {
                return res.status(400).json({ 
                    message: 'Update Error',
                    errors: error.message ? [error.message] : []
                })
            }


            
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