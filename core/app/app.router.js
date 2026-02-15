import express from 'express'
import { register, login, userInterfaces, updateAccount, updatePic } from './app.controller.js'
import { upload } from './app.upload.js';

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

export function profileRouter(){
    const router = express.Router()
    router.put('/update', updateAccount)
    router.put('/picture', upload('picture').single("pic"), updatePic)

    return router
}