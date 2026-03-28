import { getModel } from "./database.registry.js";
import { Op, col, where } from 'sequelize'
export default class DatabaseService {
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        const paths = this.extractPopulatePaths(table.response?.list)
        const include = this.buildSequelizeInclude(paths, table.response?.list)

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

        const data = await Promise.all(
            rows.map(row =>
                this.mapRow(row.toJSON(), table.response?.list)
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

        const populatePaths = this.extractPopulatePaths(table.response?.single)
        const include = this.buildSequelizeInclude(populatePaths, table.response?.single)
        const attributes = this.extractSelectFields(table.response?.single)

        const row = await table.model.findOne({
            where: { id },
            attributes,
            include
        })

        if (!row) return null

        return await this.mapRow(row.toJSON(), table.response?.single)
    }

    async create(table, payload) {
        try {
            if(table.events?.beforeCreate)
            {
                await table.events?.beforeCreate({table, payload})
            }

            const data = await table.model.create(payload)

            if(table.events?.afterCreate)
            {
                await table.events?.afterCreate({table, data, payload})
            }
    
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

            await table.model.update(payload, {
                where: { id }
            })

            const data = await table.model.findByPk(id)

            if(table.events?.afterUpdate)
            {
                await table.events?.afterUpdate({table, data, payload, oldData})
            }

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

        const deleted = await table.model.destroy({
            where: { id }
        })

        if(table.events?.afterDelete)
        {
            await table.events?.afterDelete({table, data})
        }

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

    buildSequelizeInclude(relations = [], fields = {}) {

        const include = []

        for (const relation of relations) {

            let nestedConfig = null

            for (const config of Object.values(fields)) {
                if (config?.as === relation) {
                    nestedConfig = config
                    break
                }
            }

            if(nestedConfig) {
                const where = nestedConfig?.where
                const required = nestedConfig?.required ?? false

                const attributes = nestedConfig?.fields
                    ? this.extractSelectFields(nestedConfig.fields)
                    : []

                include.push({
                    association: relation,
                    attributes,
                    ...(where && { where }),
                    required
                })
            } else {

                // existing dot-notation logic
                const attributes = new Set()

                for (const config of Object.values(fields)) {

                    if (typeof config?.value !== 'string') continue
                    if (!config.value.includes('.')) continue

                    const [rel, field] = config.value.split('.')

                    if (rel === relation) {
                        attributes.add(field)
                    }
                }

                include.push({
                    association: relation,
                    attributes: [...attributes]
                })
            }
        }

        return include
    }

    // ambil root select field
    extractSelectFields(fields = {}) {

        const set = new Set()

        for (const [key, config] of Object.entries(fields)) {

            // skip pivot
            if (config?.pivot) continue

            // 🔥 skip nested relation object (hasMany / hasOne)
            if (config?.relation && config?.fields) continue

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
    async mapRow(row, fields) {
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
                result[key] = config.value(row)
                continue
            }

            // 🔥 HAS MANY / HAS ONE (object relation)
            if (config?.relation && config?.fields) {

                const relationData = row[config.as] || []

                if (Array.isArray(relationData)) {

                    result[key] = await Promise.all(
                        relationData.map(item =>
                            this.mapRow(item, config.fields)
                        )
                    )

                } else {

                    result[key] = relationData
                        ? await this.mapRow(relationData, config.fields)
                        : null
                }

                continue
            }

            // RELATION (include)
            if (config.relation) {
                result[key] = this.resolveValue(row, config.value)
                continue
            }

            result[key] = row[key] ?? ''
        }

        return result
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