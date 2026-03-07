import { sequelize } from './database.sequelize.js'

const registry = new Map()
const migrationRegistry = new Map()

function registerModel(name, fields, options = {}, relations = []) {
    if (sequelize.models[name]) {
        return sequelize.models[name]
    }

    const model = sequelize.define(
        name,
        fields,
        {
            tableName: options.tableName ?? name,
            paranoid: options.paranoid ?? false,
            timestamps: options.timestamps ?? false,
            createdAt: options.timestamps ? options.createdAt : false,
            updatedAt: options.timestamps ? options.updatedAt : false,
            deletedAt: options.timestamps ? options.deletedAt : false
        }
    )

    if(relations)
    {
        for(const relation of relations)
        {
            const relationModel = sequelize.models[relation.modelName]
            model[relation.type](relationModel, {
                as: relation.as,
                foreignKey: relation.foreignKey
            })
        }
    }

    return model
}

export function registerTable(name, config) {
    const fields = config.schema.fields
    const options = config.schema.options ?? {}
    const relations = config.schema.relations ?? []

    const model = registerModel(name, fields, options, relations)
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