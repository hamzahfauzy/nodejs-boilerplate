import { getCollection } from "#collection/collection.registry.js";

export class Setting {

    static cache = new Map()
    static loaded = false

    static async loadAll() {
        if (this.loaded) return

        const rows = await getCollection('settings').model.find().lean()

        for (const row of rows) {
            this.cache.set(row.key, row.value)
        }

        this.loaded = true
    }

    // GET
    static async get(key, defaultValue = null) {
        await this.loadAll()

        return this.cache.has(key)
            ? this.cache.get(key)
            : defaultValue
    }

    // SET
    static async set(key, value, label = null) {

        await getCollection('settings').model.updateOne(
            { key },
            {
                $set: { value, label }
            },
            { upsert: true }
        )

        this.cache.set(key, value)

        return true
    }

    // GET MANY
    static async getMany(keys = []) {
        await this.loadAll()

        const result = {}

        for (const key of keys) {
            result[key] = this.cache.get(key) ?? null
        }

        return result
    }

    // CLEAR CACHE
    static clear() {
        this.cache.clear()
        this.loaded = false
    }
}