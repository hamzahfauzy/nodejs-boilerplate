import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import createCollectionRouter from '#collection/collection.router.js'
import { collectionMiddleware } from '#collection/collection.middleware.js'
import { appLoader } from './core/app/app.loader.js'
import { authMiddleware } from './core/app/app.middleware.js'
import { authRouter, uiRouter } from './core/app/app.router.js'
import bodyParser from 'body-parser'

dotenv.config()

const user = process.env.DB_USER && process.env.DB_PASS ? process.env.DB_USER + ':' + process.env.DB_PASS + '@' : ''
const connectionString = `mongodb://${user}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
await mongoose.connect(connectionString)
await appLoader()

const app = express()
const port = process.env.APP_PORT ?? 3000

app.use(cors())

app.use(express.json())

app.use('/auth', authRouter())

app.use(authMiddleware)

app.use('/ui', uiRouter())

app.use('/collection/:collection', collectionMiddleware(), createCollectionRouter())

app.listen(port, () => {
  console.log(`App running on port ${port}`)
});