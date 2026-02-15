import mongoose from 'mongoose'
const registry = new Map()

function registerModel(name, schema, options) {
    if (mongoose.models[name]) return mongoose.models[name];
    const finalSchema = new mongoose.Schema(schema, options)
    if(options?.timestamps)
    {
        finalSchema.pre('save', function(next) {
            this.updatedAt = Date.now();
            next();
        });
    }
    return mongoose.model(name, new mongoose.Schema(finalSchema));
}

export function getModel(name){
    return mongoose.models[name];
}

export function registerCollection(name, config) {
    const fields = config.schema.fields
    const options = config.schema.options ?? {}
    const model = registerModel(name, fields, options)
    config.model = model
    registry.set(name, config)
}

export function getCollection(name){
    return registry.get(name)
}