import express from 'express'
import collectionController from './collection.controller.js'
import { collectionPermission } from './collection.middleware.js'

export default function createCollectionRouter() {
    const router = express.Router()
    const ctrl = collectionController()

    router.get('/columns', ctrl.columns)
    router.get('/', collectionPermission('list'), ctrl.list)
    router.get('/:id', collectionPermission('single'), ctrl.single)
    router.post('/', collectionPermission('create'), ctrl.create)
    router.put('/:id', collectionPermission('update'), ctrl.update)
    router.delete('/:id', collectionPermission('delete'), ctrl.remove)

    return router
}