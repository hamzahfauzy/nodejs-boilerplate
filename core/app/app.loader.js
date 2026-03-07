import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { register } from './app.registry.js'
import mongoose from 'mongoose'
import ui from './app.ui.js'

const apps = []

async function loadApp(appDir, name){
    const manifestPath = path.join(appDir, name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(name, 'manifest.json not found')
        return
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath));

    const appName = manifest.name; // ← IDENTITAS ASLI
    const entry = path.join(appDir, name, manifest.entry)
    if (!fs.existsSync(entry)) return

    console.log(`🔌 Loading App: ${appName}`)
    const app = await import(pathToFileURL(entry) + `?v=${Date.now()}`)

    const instance = app.default

    if(instance.init){
        await instance.init({ register, ui, db: mongoose })
    }

    apps.push(instance)
}

export async function appLoader() {
    
    await loadApp(path.resolve('core/app'), 'main')
    
    const appDir = path.resolve('app')
    const app_modules = (process.env.APP_MODULES).split(',')
    
    if (!fs.existsSync(appDir)) return
    for(const module of app_modules)
    {
        await loadApp(appDir, module)
    }

    await loadApp(path.resolve('core/app'), 'default')

    for(const app of apps){
        if(app.boot){
            await app.boot({ register, ui, db: mongoose })
        }
    }
}