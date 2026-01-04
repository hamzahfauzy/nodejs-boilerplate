import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { register } from './app.registry.js'
import mongoose from 'mongoose'
import ui from './app.ui.js'

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
    app.default.init({
        register,
        ui,
        db: mongoose
    });
}

export async function appLoader() {
    
    loadApp(path.resolve('core/app'), 'default')
    
    const appDir = path.resolve('app')
    
    if (!fs.existsSync(appDir)) return

    for (const name of fs.readdirSync(appDir)) {
        loadApp(appDir, name)
    }
}