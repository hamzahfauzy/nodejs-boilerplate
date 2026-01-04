import mongoose from 'mongoose'
const registry = new Map()

function registerModel(name, schema) {
    if (mongoose.models[name]) return mongoose.models[name];
    const finalSchema = new mongoose.Schema(schema)
    return mongoose.model(name, new mongoose.Schema(finalSchema));
}

export function getModel(name){
    return mongoose.models[name];
}

export function registerCollection(name, config) {
    const model = registerModel(name, config.schema)
    config.model = model
    registry.set(name, config)
}

export function getCollection(name){
    return registry.get(name)
}