import 'dotenv/config'
import { appLoader } from './core/app/app.loader.js'
import { pathToFileURL } from 'url'

await appLoader()
const { runSqlMigrations } = await import(pathToFileURL('./core/database/database.migrate.js'))
runSqlMigrations()