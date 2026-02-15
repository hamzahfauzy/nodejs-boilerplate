import { sequelize, DataTypes } from './database.sequelize.js'

const registry = new Map()
const migrationRegistry = new Map()

function registerModel(name, fields, options = {}) {
    if (sequelize.models[name]) {
        return sequelize.models[name]
    }

    const model = sequelize.define(
        name,
        fields,
        {
            tableName: options.tableName ?? name,
            timestamps: options.timestamps ?? false,
            createdAt: options.timestamps ? 'created_at' : false,
            updatedAt: options.timestamps ? 'updated_at' : false
        }
    )

    return model
}

export function registerTable(name, config) {
    const fields = config.schema.fields
    const options = config.schema.options ?? {}

    const model = registerModel(name, fields, options)
    config.model = model

    registry.set(name, config)
}

export function getTable(name) {
    return registry.get(name)
}

export function getModel(name) {
    return sequelize.models[name]
}

export function registerMigration(name, filepath) {
    migrationRegistry.set(name, filepath)
}

export function getMigrationFile(){
    return Object.fromEntries(migrationRegistry)
}