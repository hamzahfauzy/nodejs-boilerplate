import { upload } from '#app/app.upload.js'
import { getTable } from '#database/database.registry.js'
import DatabaseService from '#database/database.service.js'
export function documentRouter(router){
    router.post('/uploads', upload('documents').array('files', 10), async (req, res) => {
        const service = new DatabaseService()
        const table = getTable('documents')
        
        const documents = [];
        for(const file of req.files){
            const data = {
                user_id: req.user._id.toString(),
                type: 'file',
                name: file.originalname,
                mime_type: file.mimetype,
                size: file.size,
                storage_path: file.path
            }

            if(req.body?.parent_id)
            {
                data.parent_id = req.body?.parent_id
            }

            const document = await service.create(table, data)
            documents.push(document)
        }

        res.json({
            data: documents,
            message: 'success'
        })
    })
}