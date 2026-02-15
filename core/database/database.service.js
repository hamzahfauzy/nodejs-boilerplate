import { getModel } from "./database.registry.js";
import { Op } from 'sequelize'
export default class DatabaseService {
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async list(table, query, limit = 20){

        limit = parseInt(limit)
        const sortField = query.order?.column || 'id'
        const orderDir = query.order?.dir || 'asc'

        const where = {}

        const searchValue = this.escapeRegex(query.search || '')

        if (searchValue && table.response?.list) {
            const orFilters = []

            for (const [key, config] of Object.entries(table.response.list)) {

                if (config.searchable !== true) continue
                if (typeof config.value === 'string' && config.value.includes('.')) continue
                if (config.relation === true) continue

                orFilters.push({
                    [key]: {
                        [Op.like]: `%${searchValue}%`
                    }
                })
            }

            if (orFilters.length) {
                where[Op.or] = orFilters
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

                // NUMBER
                else if (!isNaN(value) && value !== '') {
                    andFilters.push({ [key]: Number(value) })
                }

                // STRING
                else if (typeof value === 'string' && value.trim() !== '') {
                    andFilters.push({
                        [key]: {
                            [Op.like]: `%${value}%`
                        }
                    })
                }
            }

            if (andFilters.length) {
                where[Op.and] = andFilters
            }
        }

        /* =========================
        * INCLUDE (POPULATE)
        * ========================= */
        const paths = this.extractPopulatePaths(table.response?.list)
        const include = this.buildSequelizeInclude(paths)

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
                where,
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
        const row = await table.model.create(payload)

        return await this.mapRow(row.toJSON(), table.response?.single)
    }

    async update(table, id, payload) {

        await table.model.update(payload, {
            where: { id }
        })

        const row = await table.model.findByPk(id)

        if (!row) return null

        return await this.mapRow(row.toJSON(), table.response?.single)
    }

    async delete(table, id) {

        return table.model.destroy({
            where: { id }
        })
    }

    getColumn(table){
        return Object.values(table.response.list).map(field => {
            return field.label
        })
    }

    // ambil semua populate path dari config
    extractPopulatePaths(fields) {
        const paths = []

        for (const config of Object.values(fields)) {
            if (config.pivot) continue   // ⬅️ TAMBAH
            if (typeof config.value === 'string') {
                paths.push(config.value)
            }
        }

        return [...new Set(paths)]
    }

    buildSequelizeInclude(paths, config) {
        return paths.map(path => ({
            association: path,
            attributes: this.extractSelectFields(config[path])
        }))
    }

    // ambil root select field
    extractSelectFields(fields) {
        const set = new Set()

        for (const [key, config] of Object.entries(fields)) {

            if (config.pivot) continue

            if (typeof config.value === 'string') {
                set.add(config.value.split('.')[0])
            } else {
                set.add(key)
            }
        }

        return [...set] // ⬅️ array, bukan string
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