import express from 'express'
import { register, login, userInterfaces } from './app.controller.js'

export function authRouter(){
    const router = express.Router()
    router.post('/register', register)
    router.post('/login', login)

    return router
}

export function uiRouter(){
    const router = express.Router()
    router.get('/bootstrap', userInterfaces)

    return router
}