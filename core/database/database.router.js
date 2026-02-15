import express from 'express'
import DatabaseController from './database.controller.js'
import { databasePermission } from './database.middleware.js'

export default function createTableRouter() {
    const router = express.Router()
    const ctrl = DatabaseController()

    router.get('/columns', ctrl.columns)
    router.get('/', databasePermission('list'), ctrl.list)
    router.get('/:id', databasePermission('single'), ctrl.single)
    router.post('/', databasePermission('create'), ctrl.create)
    router.put('/:id', databasePermission('update'), ctrl.update)
    router.delete('/:id', databasePermission('delete'), ctrl.remove)

    return router
}