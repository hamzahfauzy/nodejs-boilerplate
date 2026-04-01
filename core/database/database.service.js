import { getModel, getTable } from "./database.registry.js";
import { Op, col, where } from 'sequelize'
import { eventBus } from "#libs/eventBus.js";

export default class DatabaseService {
    
    escapeRegex(text) {
        return text && text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async list(table, query, limit = 20){

        limit = parseInt(limit)
        const sortField = query.order?.column || 'id'
        const orderDir = query.order?.dir || 'asc'

        const _where = {}

        const searchValue = this.escapeRegex(query.search || '')

        if (searchValue && table.response?.list) {
            const orFilters = []

            for (const [key, config] of Object.entries(table.response.list)) {

                if (config.searchable !== true) continue
                if (config.relation) {
                    orFilters.push(where(
                        col(config.value),
                        {
                            [Op.like]: `%${searchValue}%`
                        }
                    ))
                } else {
                    orFilters.push({
                        [key]: {
                            [Op.like]: `%${searchValue}%`
                        }
                    })
                }

            }

            if (orFilters.length) {
                _where[Op.or] = orFilters
            }
        }


        /* =========================
        * FILTERS (AND)
        * ========================= */
        const filters = query.filters || {}
        if (Object.keys(filters).length) {

            const andFilters = []

            for (const [key, value] of Object.entries(filters)) {

                // BOOLEAN
                if (value === 'true' || value === 'false') {
                    andFilters.push({ [key]: value === 'true' })
                }
                
                else if(value == null)
                {
                    andFilters.push({
                        [key]: {
                            [Op.is]: null
                        }
                    })
                }

                // NUMBER
                else if (!isNaN(value) && value !== '') {
                    andFilters.push({ [key]: Number(value) })
                }

                // STRING
                else if (typeof value === 'string' && value.trim() !== '') {
                    if(value.trim() == 'null')
                    {
                        andFilters.push({
                            [key]: {
                                [Op.is]: null
                            }
                        })
                    }
                    else
                    {
                        andFilters.push({
                            [key]: {
                                [Op.like]: `%${value}%`
                            }
                        })
                    }
                }
            }

            if (andFilters.length) {
                _where[Op.and] = andFilters
            }
        }

        /* =========================
        * INCLUDE (POPULATE)
        * ========================= */
        // const paths = this.extractPopulatePaths(table.response?.list)
        // const include = this.buildSequelizeInclude([], table.response?.list)
        const includeTree = this.buildIncludeTree(table.response?.list)
        const includeFromPath = this.buildSequelizeIncludeFromTree(includeTree, table.model)

        const includeFromObject = this.buildIncludeFromRelationObject(table.response?.list, table.model)

        const include = this.mergeIncludes(includeFromPath, includeFromObject)

        // const includeTree = this.buildIncludeTree(table.response?.list)
        // const include = this.buildSequelizeIncludeFromTree(includeTree, table.model)

        /* =========================
        * SELECT FIELDS
        * ========================= */
        const attributes = this.extractSelectFields(
            table.response?.list
        )

        /* =========================
        * PAGINATION
        * ========================= */
        const page = Number(query.page || 1)
        const offset = (page - 1) * limit

        /* =========================
        * QUERY
        * ========================= */
        const { rows, count: total } =
            await table.model.findAndCountAll({
                where: _where,
                attributes,
                include,
                order: [[sortField, orderDir]],
                limit,
                offset,
                distinct: true // ⬅️ penting kalau ada include
            })

        const morphCache = {}
        const data = await Promise.all(
            rows.map(row =>
                this.mapRow(row.toJSON(), table.response?.list, morphCache)
            )
        )

        const totalPages = Math.ceil(total / limit)

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }
    }

    async single(table, id) {

        await eventBus.emitAsync(`${table.name}.single`, {table, id})

        const includeTree = this.buildIncludeTree(table.response?.single)
        const includeFromPath = this.buildSequelizeIncludeFromTree(includeTree, table.model)

        const includeFromObject = this.buildIncludeFromRelationObject(table.response?.single, table.model)

        const include = this.mergeIncludes(includeFromPath, includeFromObject)

        const attributes = this.extractSelectFields(table.response?.single)

        const row = await table.model.findOne({
            where: { id },
            attributes,
            include
        })

        if (!row) return null

        const morphCache = {}

        return await this.mapRow(row.toJSON(), table.response?.single, morphCache)
    }

    async singleByClause(table, where) {

        await eventBus.emitAsync(`${table.name}.singleByClause`, {table, where})

        const includeTree = this.buildIncludeTree(table.response?.single)
        const includeFromPath = this.buildSequelizeIncludeFromTree(includeTree, table.model)

        const includeFromObject = this.buildIncludeFromRelationObject(table.response?.single, table.model)

        const include = this.mergeIncludes(includeFromPath, includeFromObject)

        const attributes = this.extractSelectFields(table.response?.single)

        const row = await table.model.findOne({
            where,
            attributes,
            include
        })

        if (!row) return null

        const morphCache = {}

        return await this.mapRow(row.toJSON(), table.response?.single, morphCache)
    }

    async create(table, payload) {

        try {
            if(table.events?.beforeCreate)
            {
                await table.events?.beforeCreate({table, payload})
            }
            
            await eventBus.emitAsync(`${table.name}.beforeCreate`, {table, payload})
            
            const data = await table.model.create(payload)
            
            if(table.events?.afterCreate)
            {
                await table.events?.afterCreate({table, data, payload})
            }
            
            await eventBus.emitAsync(`${table.name}.afterCreate`, {table, payload})
    
            return await this.mapRow(data.toJSON(), table.response?.single)
            
        } catch (error) {
            throw error
        }
    }

    async update(table, id, payload) {
        try {
            const oldData = await table.model.findByPk(id)

            if(table.events?.beforeUpdate)
            {
                await table.events?.beforeUpdate({table, oldData, payload})
            }

            await eventBus.emitAsync(`${table.name}.beforeUpdate`, {table, oldData, payload})

            await table.model.update(payload, {
                where: { id }
            })

            const data = await table.model.findByPk(id)

            if(table.events?.afterUpdate)
            {
                await table.events?.afterUpdate({table, data, payload, oldData})
            }
            await eventBus.emitAsync(`${table.name}.afterUpdate`, {table, data, payload, oldData})

            if (!data) return null

            return await this.mapRow(data.toJSON(), table.response?.single)
            
        } catch (error) {
            throw error
        }
    }

    async delete(table, id) {

        const data = await table.model.findByPk(id)

        if(table.events?.beforeDelete)
        {
            await table.events?.beforeDelete({table, data})
        }
        await eventBus.emitAsync(`${table.name}.beforeDelete`, {table, data})

        const deleted = await table.model.destroy({
            where: { id }
        })

        if(table.events?.afterDelete)
        {
            await table.events?.afterDelete({table, data})
        }
        await eventBus.emitAsync(`${table.name}.afterDelete`, {table, data})

        return deleted
    }

    getColumn(table){
        return Object.values(table.response.list).map(field => {
            return field.label
        })
    }

    // ambil semua populate path dari config
    extractPopulatePaths(fields = {}) {
        const relations = new Set()

        for (const [key, config] of Object.entries(fields)) {

            if (config?.pivot) continue

            // 🔥 SUPPORT OBJECT RELATION (hasMany / hasOne)
            if (config?.relation && config?.as) {
                relations.add(config.as)
                continue
            }

            // existing logic (dot notation)
            if (typeof config?.value === 'string' && config.value.includes('.')) {
                const relation = config.value.split('.')[0]
                relations.add(relation)
            }
        }

        return [...relations]
    }

    buildNestedIncludeFromWith(withString, model) {
        if (!withString) return []

        const parts = withString.split('.')
        let currentModel = model
        let root = []
        let pointer = root

        for (const relation of parts) {

            const association = currentModel.associations[relation]
            if (!association) break

            const node = {
                association: relation,
                required: false,
                include: []
            }

            pointer.push(node)

            currentModel = association.target
            pointer = node.include
        }

        return root
    }

    buildIncludeFromRelationObject(fields, model, depth = 0) {
        const includes = []

        for (const key in fields) {

            const field = fields[key]

            if (!field.relation || !field.as) continue

            const association = model.associations[field.as]
            if (!association) continue

            const targetModel = association.target
            const targetTable = getTable(targetModel.name)

            // 🔥 AUTO ambil response.single jika tidak ada fields
            const nestedFields =
                field.fields ??
                targetTable?.response?.single

            // 🔥 ambil attributes dari nestedFields
            // const attributes = nestedFields
            //     ? this.extractSelectFields(nestedFields)
            //     : undefined

            let nestedInclude = []

            // 🔥 1️⃣ from nested fields
            if (nestedFields) {
                nestedInclude = this.buildIncludeFromRelationObject(
                    nestedFields,
                    targetModel,
                    depth + 1
                )
            }

            // 🔥 2️⃣ from "with"
            if (field.with) {
                const withInclude = this.buildNestedIncludeFromWith(
                    field.with,
                    targetModel
                )

                nestedInclude = this.mergeIncludes(nestedInclude, withInclude)
            }

            const includeConfig = {
                association: field.as,
                required: field.required ?? false,
                include: nestedInclude,
                ...(field.where && { where: field.where }) // ⬅️ tambahkan ini
            }

            // 🔥 SUPPORT COMPOSITE FK
            if (field.foreignKey && Array.isArray(field.foreignKey)) {

                const sourceTable = model.getTableName()
                const targetTable = association.target.getTableName()

                const onConditions = {}

                field.foreignKey.forEach((fk, index) => {
                    const targetKey = field.targetKey?.[index] || fk

                    onConditions[`${targetTable}.${targetKey}`] =
                        col(`${sourceTable}.${fk}`)
                })

                includeConfig.on = onConditions
            }

            includes.push(includeConfig)
        }

        return includes
    }

    mergeIncludes(a = [], b = []) {
        const map = new Map()

        ;[...a, ...b].forEach(item => {
            const key = item.association

            if (!map.has(key)) {
                map.set(key, { ...item })
            } else {
                const existing = map.get(key)

                // 🔥 merge include recursively
                existing.include = this.mergeIncludes(
                    existing.include || [],
                    item.include || []
                )

                // 🔥 merge where (override jika ada)
                if (item.where) {
                    existing.where = item.where
                }

                // 🔥 merge required
                if (item.required !== undefined) {
                    existing.required = item.required
                }
            }
        })

        return Array.from(map.values())
    }

    buildIncludeTree(fields) {
        const tree = {}

        for (const key in fields) {
            const field = fields[key]

            if (!field.relation) continue

            // 🔥 OBJECT RELATION (hasMany / hasOne)
            if (field.fields && field.as) {

                if (!tree[field.as]) {
                    tree[field.as] = this.buildIncludeTree(field.fields)
                }

                continue
            }

            // 🔥 STRING RELATION
            if (typeof field.value === 'string') {
                const parts = field.value.split('.')
                const relationPath = parts.slice(0, -1)

                let current = tree

                for (const relation of relationPath) {
                    if (!current[relation]) {
                        current[relation] = {}
                    }
                    current = current[relation]
                }
            }
        }

        return tree
    }

    buildSequelizeIncludeFromTree(tree, model) {
        const includes = []

        for (const relation in tree) {
            const association = model.associations[relation]
            if (!association) continue

            includes.push({
                association: relation,
                required: false,
                include: this.buildSequelizeIncludeFromTree(
                    tree[relation],
                    association.target
                )
            })
        }

        return includes
    }

    buildSequelizeInclude(relations = [], fields = {}) {

        const include = []

        for (const [key, config] of Object.entries(fields)) {

            if (!config?.relation || !config?.as) continue

            const attributes = config?.fields
                ? this.extractSelectFields(config.fields)
                : undefined

            const nestedInclude = config?.fields
                ? this.buildSequelizeInclude([], config.fields)
                : undefined

            include.push({
                association: config.as,
                attributes,
                ...(nestedInclude?.length && { include: nestedInclude }),
                ...(config.where && { where: config.where }),
                required: config.required ?? false
            })
        }

        return include
    }

    // ambil root select field
    extractSelectFields(fields = {}) {

        const set = new Set()

        for (const [key, config] of Object.entries(fields)) {

            // skip pivot
            if (config?.pivot) continue

            // skip morph
            if (config?.morph) continue

            // 🔥 skip nested relation object (hasMany / hasOne)
            if (config?.relation) continue

            // skip dot-notation (belongsTo)
            if (typeof config?.value === 'string' && config.value.includes('.')) {
                continue
            }

            // 🔥 skip computed field
            if (typeof config?.value === 'function') continue

            set.add(key)
        }

        return [...set]
    }

    // mapping hasil ke format DataTable
    async mapRow(row, fields, morphCache = {}) {
        const result = {}

        if (!row) return result

        for (const [key, config] of Object.entries(fields)) {

            // PIVOT (Many-to-Many manual)
            if (config.pivot) {
                const value = await this.resolvePivot(row.id, config.pivot)
                result[key] = value

                if (Array.isArray(value) && config.pivot.foreignKey) {
                    const idKey = key.endsWith('s')
                        ? key.slice(0, -1) + 'Ids'
                        : key + 'Ids'

                    result[idKey] = value.map(v => v?.id).filter(Boolean)
                }

                continue
            }

            // COMPUTED FIELD
            if (typeof config.value === 'function') {
                // result[key] = config.value(row)
                continue
            }

            // 🔥 HAS MANY / HAS ONE / BELONGS TO (object relation)
            if (config?.relation && config?.as) {

                const relationData = row[config.as]

                if (!relationData) {
                    result[key] = Array.isArray(relationData) ? [] : null
                    continue
                }

                const association = row.constructor.associations?.[config.as]
                const targetModel = association?.target
                const targetTable = getTable(targetModel?.name)

                // 🔥 AUTO ambil default response.single
                // const relationFields =
                //     config.fields ??
                //     targetTable?.response?.single

                let relationFields = config.fields

                // 🔥 jika fields adalah function, resolve dulu
                if (typeof relationFields === 'function') {
                    relationFields = relationFields()
                }

                // fallback ke default response.single
                if (!relationFields) {
                    relationFields = targetTable?.response?.single
                }

                if (!relationFields) {
                    result[key] = relationData
                    continue
                }

                if (Array.isArray(relationData)) {

                    result[key] = await Promise.all(
                        relationData.map(item =>
                            this.mapRow(item, relationFields, morphCache)
                        )
                    )

                } else {

                    result[key] = await this.mapRow(
                        relationData,
                        relationFields,
                        morphCache
                    )
                }

                continue
            }

            // RELATION (include)
            if (config.relation && typeof config.value === 'string') {
                result[key] = this.getNestedValue(row, config.value)
                continue
            }

            // 🔥 MORPH TO (dynamic reference)
            if (config?.pivoting) {
                const tableName = config.tableName
                const ref_name = row[config.typeField || 'ref_name']
                const ref_id = row[config.idField || 'ref_id']

                if (!ref_name || !ref_id) {
                    result[key] = null
                    continue
                }

                const table = getTable(tableName)

                if(!table)
                {
                    result[key] = null
                    continue
                }

                // 🔥 INIT CACHE GROUP
                if (!morphCache[tableName]) {
                    morphCache[tableName] = {}
                }

                // 🔥 LOAD IF NOT EXISTS
                if (!morphCache[tableName][ref_id]) {
                    const ref = await this.singleByClause(table, {
                        ref_name, ref_id
                    })
                    morphCache[tableName][ref_id] = ref ?? null
                }

                const refData = morphCache[tableName][ref_id]

                result[key] = config.fields && refData
                    ? await this.mapRow(refData, config.fields, morphCache)
                    : refData

                continue
            }

            if (config?.morph) {

                const type = row[config.typeField || 'ref_name']
                const id = row[config.idField || 'ref_id']

                if (!type || !id) {
                    result[key] = null
                    continue
                }

                const table = getTable(type)

                if(!table)
                {
                    result[key] = null
                    continue
                }

                // 🔥 INIT CACHE GROUP
                if (!morphCache[type]) {
                    morphCache[type] = {}
                }

                // 🔥 LOAD IF NOT EXISTS
                if (!morphCache[type][id]) {
                    const ref = await this.single(table, id)
                    morphCache[type][id] = ref ?? null
                }

                const refData = morphCache[type][id]

                result[key] = config.fields && refData
                    ? await this.mapRow(refData, config.fields, morphCache)
                    : refData

                continue
            }

            result[key] = row[key] ?? null
        }

        for (const [key, config] of Object.entries(fields)) {
            if (typeof config.value === 'function') {
                result[key] = config.value(result)
                continue
            }
        }

        return result
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => {
            return acc ? acc[part] : null
        }, obj)
    }

    async resolvePivot(parentId, pivot) {
        const Parent = getModel(pivot.parent)
        const Target = getModel(pivot.target)

        const row = await Parent.findByPk(parentId, {
            include: [{
                model: Target,
                as: pivot.as,
                attributes: pivot.select || undefined,
                through: { attributes: [] }
            }]
        })

        return row ? row[pivot.as] : []
    }

    async resolveThroughPivot(parentIds, through) {
        const Parent = getModel(through.parent)
        const Target = getModel(through.target)

        return Parent.findAll({
            where: { id: parentIds },
            include: [{
                model: Target,
                as: through.as,
                attributes: through.select || undefined,
                through: { attributes: [] }
            }]
        })
    }

    resolveValue(obj, path) {
        return path.split('.').reduce((acc, key) => {
            if (!acc) return null

            if (Array.isArray(acc)) {
                return acc.map(i => i?.[key]).filter(Boolean)
            }

            return acc[key]
        }, obj)
    }
}