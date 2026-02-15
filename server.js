import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import createCollectionRouter from '#collection/collection.router.js'
import createTableRouter from '#database/database.router.js'
import { collectionMiddleware } from '#collection/collection.middleware.js'
import { databaseMiddleware } from '#database/database.middleware.js'
import { appLoader } from './core/app/app.loader.js'
import { authMiddleware, logMiddleware } from './core/app/app.middleware.js'
import { authRouter, uiRouter, profileRouter } from './core/app/app.router.js'
import { appRouter } from '#app/app.registry.js'

const user = process.env.DB_USER && process.env.DB_PASS ? process.env.DB_USER + ':' + process.env.DB_PASS + '@' : ''
const connectionString = `mongodb://${user}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
await mongoose.connect(connectionString)
await appLoader()

const app = express()
const port = process.env.APP_PORT ?? 3000

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(
  "/storage",
  express.static("storage")
);

app.use('/auth', authRouter())

app.use(authMiddleware)
app.use(logMiddleware)

app.use(appRouter)

app.use('/ui', uiRouter())
app.use('/profile', profileRouter())
app.use('/collection/:collection', collectionMiddleware(), createCollectionRouter())
app.use('/table/:table', databaseMiddleware(), createTableRouter())

app.listen(port, () => {
  console.log(`App running on port ${port}`)
});