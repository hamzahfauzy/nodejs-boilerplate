import { getModel } from "./collection.registry.js"
export default class CollectionService {

    async datatable(collection, query) {

        const draw = Number(query.draw || 1)
        const start = Number(query.start || 0)
        const length = Number(query.length || 10)

        const searchValue = query.search?.value || ''

        const orderColumnIndex = query.order?.[0]?.column
        const orderDir = query.order?.[0]?.dir || 'asc'

        const columns = query.columns || []
        const sortField = columns[orderColumnIndex]?.data || '_id'

        // filter
        const filter = {}

        if (searchValue && collection.response?.list) {
            const orFilters = []
            for (const [key, config] of Object.entries(collection.response.list)) {
                // hanya field searchable
                if (config.searchable !== true) continue

                // hanya field primitive (tanpa dot / tanpa relation)
                if (typeof config.value === 'string' && config.value.includes('.')) continue
                if (config.relation === true) continue

                // gunakan KEY field, bukan config.data
                orFilters.push({
                    [key]: { $regex: searchValue, $options: 'i' }
                })
            }

            if (orFilters.length) {
                filter.$or = orFilters
            }
        }

        const recordsTotal = await collection.model.countDocuments({})
        const recordsFiltered = await collection.model.countDocuments(filter)

        const populatePaths = this.extractPopulatePaths(collection.response?.list)
        const populateTree = this.buildPopulateTree(populatePaths)
        const populates = this.buildPopulateFromTree(populateTree, collection.response?.list)
        const selectFields = this.extractSelectFields(collection.response?.list)

        const db = collection.model
            .find(filter)
            .select(selectFields)
            .sort({ [sortField]: orderDir === 'asc' ? 1 : -1 })
            .skip(start)
            .limit(length)
            .lean()

        populates.forEach(p => db.populate(p))

        const rows = await db
        const data = rows.map(row => Object.values(this.mapRow(row, collection.response?.list)))

        return {
            draw,
            recordsTotal,
            recordsFiltered,
            data
        }
    }

    async list(collection, query, limit = 20){

        const sortField = query.order?.column || '_id'
        const orderDir = query.order?.dir || 'asc'

        const filter = {}

        const searchValue = query.search || ''

        if (searchValue && collection.response?.list) {
            const orFilters = []
            for (const [key, config] of Object.entries(collection.response.list)) {
                // hanya field searchable
                if (config.searchable !== true) continue

                // hanya field primitive (tanpa dot / tanpa relation)
                if (typeof config.value === 'string' && config.value.includes('.')) continue
                if (config.relation === true) continue

                // gunakan KEY field, bukan config.data
                orFilters.push({
                    [key]: { $regex: searchValue, $options: 'i' }
                })
            }

            if (orFilters.length) {
                filter.$or = orFilters
            }
        }

        const filters = query.filters || {}
        if (Object.keys(filters).length) {
            const andFilters = []

            for (const [key, value] of Object.entries(filters)) {

                // BOOLEAN
                if (value === 'true' || value === 'false') {
                    andFilters.push({
                        [key]: value === 'true'
                    })
                }

                // NUMBER
                else if (!isNaN(value) && value !== '') {
                    andFilters.push({
                        [key]: Number(value)
                    })
                }

                // STRING
                else if (typeof value === 'string' && value.trim() !== '') {
                    andFilters.push({
                        [key]: { $regex: value, $options: 'i' }
                    })
                }
            }

            if (andFilters.length) {
                filter.$and = andFilters
            }
        }

        const populatePaths = this.extractPopulatePaths(collection.response?.list)
        const populateTree = this.buildPopulateTree(populatePaths)
        const populates = this.buildPopulateFromTree(populateTree, collection.response?.list)
        const selectFields = this.extractSelectFields(collection.response?.list)

        const page = Number(query.page || 1)
        const skip = (page - 1) * limit

        const total = await collection.model.countDocuments(filter)

        const db = collection.model.find(filter)
            .collation({ locale: 'id', strength: 2 })
            .select(selectFields)
            .sort({ [sortField]: orderDir === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        populates.forEach(p => db.populate(p))

        const rows = await db
        const data = await Promise.all(
            rows.map(row => this.mapRow(row, collection.response?.list))
        )

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            }
        }
    }

    async single(collection, id){
        const filter = {_id: id}

        const populatePaths = this.extractPopulatePaths(collection.response?.single)
        const populateTree = this.buildPopulateTree(populatePaths)
        const populates = this.buildPopulateFromTree(populateTree, collection.response?.single)
        const selectFields = this.extractSelectFields(collection.response?.single)

        const db = collection.model
                    .findOne(filter)
                    .select(selectFields)
                    .lean()

        populates.forEach(p => db.populate(p))

        const row = await db
        const data = await this.mapRow(row, collection.response?.single)

        return data
    }

    async create(collection, payload){
        const row = await collection.model.create(payload)

        return await this.mapRow(row, collection.response?.single)
    }

    async update(collection, id, payload){
        const filter = { _id: id }

        const row = await collection.model.findByIdAndUpdate(filter, payload, {new: true, runValidators: true})

        return await this.mapRow(row, collection.response?.single)
    }

    async delete(collection, id){

        const filter = { _id: id }

        return collection.model.deleteOne(filter)
    }

    getColumn(collection){
        return Object.values(collection.response.list).map(field => {
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

    // build recursive populate (reuse logic sebelumnya)
    buildPopulateTree(paths) {
        const tree = {}

        for (const path of paths) {
            const parts = path.split('.')
            let current = tree

            for (const part of parts) {
                current[part] = current[part] || {}
                current = current[part]
            }
        }

        return tree
    }

    buildPopulateFromTree(tree, fields = {}) {
        return Object.entries(tree).map(([key, subtree]) => {

            const config = Object.values(fields)
                .find(f => f.value === key || f.value?.startsWith(key))

            const populate = { path: key }

            if (config?.select) {
                populate.select = config.select.join(' ')
            }

            const children = this.buildPopulateFromTree(subtree, fields)
            if (children.length) populate.populate = children

            return populate
        })
    }

    // ambil root select field
    extractSelectFields(fields) {
        const set = new Set()

        for (const [key, config] of Object.entries(fields)) {

            if (config.pivot) continue   // ⬅️ TAMBAH

            if (typeof config.value === 'string') {
                set.add(config.value.split('.')[0])
            } else {
                set.add(key)
            }
        }

        return [...set].join(' ')
    }

    // mapping hasil ke format DataTable
    async mapRow(row, fields) {
        const result = {}

        if(row){
            for (const [key, config] of Object.entries(fields)) {

                if (config.pivot) {
                    const value = await this.resolvePivot(row._id, config.pivot)

                    result[key] = value

                    // === DERIVED IDS (GENERIC) ===
                    if (Array.isArray(value) && config.pivot.foreignKey) {
                        const idKey =
                            key.endsWith('s')
                                ? key.slice(0, -1) + 'Ids'
                                : key + 'Ids'

                        result[idKey] = value.map(v => v?._id).filter(Boolean)
                    }

                    continue
                }

                if (typeof config.value === 'function') {
                    result[key] = config.value(row)
                    continue
                }

                if (config.relation) {
                    result[key] = this.resolveValue(row, config.value)
                    continue
                }

                result[key] = row && row[key] ? row[key] : ''
            }
        }

        return result
    }

    async resolvePivot(parentId, pivot) {

        const Pivot = getModel(pivot.model)
        const Target = getModel(pivot.target)

        const pipeline = [
            { $match: { [pivot.localKey]: parentId } },
            {
                $lookup: {
                    from: Target.collection.name,
                    localField: pivot.foreignKey,
                    foreignField: '_id',
                    as: 'target'
                }
            },
            { $unwind: '$target' },
            {
                $project: {
                    _id: '$target._id'
                }
            }
        ]

        const rows = await Pivot.aggregate(pipeline)
        const targetIds = rows.map(r => r._id)

        // ⬇️ kalau tidak ada nested pivot
        if (!pivot.through) {
            return Target.find({ _id: { $in: targetIds } })
        }

        // ⬇️ nested pivot (permissions)
        return this.resolveThroughPivot(targetIds, pivot.through)
    }

    async resolveThroughPivot(parentIds, through) {

        const Pivot = getModel(through.model)
        const Target = getModel(through.target)

        const pipeline = [
            {
                $match: {
                    [through.localKey]: { $in: parentIds }
                }
            },
            {
                $lookup: {
                    from: Target.collection.name,
                    localField: through.foreignKey,
                    foreignField: '_id',
                    as: 'target'
                }
            },
            { $unwind: '$target' }
        ]

        if (Array.isArray(through.select) && through.select.length) {
            pipeline.push({
                $project: Object.fromEntries(
                    through.select.map(k => [k, `$target.${k}`])
                )
            })
        } else {
            pipeline.push({
                $replaceRoot: { newRoot: '$target' }
            })
        }

        // DISTINCT permissions
        pipeline.push({
            $group: {
                _id: '$_id',
                doc: { $first: '$$ROOT' }
            }
        })

        pipeline.push({
            $replaceRoot: { newRoot: '$doc' }
        })

        return Pivot.aggregate(pipeline)
    }

    async resolveNestedPivot(pipeline, pivot) {

        const Through = getModel(pivot.through.model)
        const Target = getModel(pivot.through.target)

        // ambil roleId hasil pipeline sebelumnya
        const roleIds = await this.resolvePivotIds(pipeline, pivot)

        if (!roleIds.length) return []

        const throughPipeline = [
            {
                $match: {
                    [pivot.through.localKey]: { $in: roleIds }
                }
            },
            {
                $lookup: {
                    from: Target.collection.name,
                    localField: pivot.through.foreignKey,
                    foreignField: '_id',
                    as: 'target'
                }
            },
            { $unwind: '$target' }
        ]

        if (pivot.through.select) {
            throughPipeline.push({
                $project: Object.fromEntries(
                    pivot.through.select.map(k => [k, `$target.${k}`])
                )
            })
        } else {
            throughPipeline.push({
                $replaceRoot: { newRoot: '$target' }
            })
        }

        // DISTINCT (penting untuk RBAC)
        throughPipeline.push({
            $group: {
                _id: '$._id',
                doc: { $first: '$$ROOT' }
            }
        })

        throughPipeline.push({
            $replaceRoot: { newRoot: '$doc' }
        })

        return Through.aggregate(throughPipeline)
    }

    async resolvePivotIds(pipeline, pivot) {

        const rows = await getModel(pivot.model).aggregate(pipeline)

        return rows
            .map(r => r._id)
            .filter(Boolean)
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