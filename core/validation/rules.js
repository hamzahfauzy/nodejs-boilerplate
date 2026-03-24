export const rules = {

    /* ======================
     * BASIC
     * ====================== */

    required(value) {
        if (value === undefined || value === null || value === '') {
            return 'field is required'
        }
    },

    nullable(value) {
        return
    },

    boolean(value) {
        if (typeof value !== 'boolean') {
            return 'must be boolean'
        }
    },

    string(value) {
        if (value !== undefined && typeof value !== 'string') {
            return 'must be string'
        }
    },

    number(value) {
        if (value !== undefined && typeof value !== 'number') {
            return 'must be number'
        }
    },

    integer(value) {
        if (value !== undefined && !Number.isInteger(value)) {
            return 'must be integer'
        }
    },

    array(value) {
        if (value !== undefined && !Array.isArray(value)) {
            return 'must be array'
        }
    },

    object(value) {
        if (value !== undefined && typeof value !== 'object') {
            return 'must be object'
        }
    },

    /* ======================
     * STRING
     * ====================== */

    min(value, limit) {
        if (value && value.length < limit) {
            return `min ${limit} character`
        }
    },

    max(value, limit) {
        if (value && value.length > limit) {
            return `max ${limit} character`
        }
    },

    length(value, len) {
        if (value && value.length !== len) {
            return `must be ${len} character`
        }
    },

    regex(value, pattern) {
        if (value && !new RegExp(pattern).test(value)) {
            return 'unexpected format'
        }
    },

    in(value, list) {
        if (value !== undefined && !list.includes(value)) {
            return `must be one of ${list.join(', ')}`
        }
    },

    notIn(value, list) {
        if (value !== undefined && list.includes(value)) {
            return 'value is not allowed'
        }
    },

    /* ======================
     * FORMAT
     * ====================== */

    email(value) {
        if (!value) return
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!re.test(value)) {
            return 'email is not valid'
        }
    },

    url(value) {
        if (!value) return
        try {
            new URL(value)
        } catch {
            return 'url is not valid'
        }
    },

    date(value) {
        if (value && isNaN(Date.parse(value))) {
            return 'date is not valid'
        }
    },

    /* ======================
     * NUMBER RANGE
     * ====================== */

    minValue(value, min) {
        if (value < min) {
            return `min ${min}`
        }
    },

    maxValue(value, max) {
        if (value > max) {
            return `max ${max}`
        }
    },

    between(value, [min, max]) {
        if (value < min || value > max) {
            return `must between ${min} - ${max}`
        }
    },

    /* ======================
     * ARRAY
     * ====================== */

    minItems(value, limit) {
        if (Array.isArray(value) && value.length < limit) {
            return `min ${limit} item`
        }
    },

    maxItems(value, limit) {
        if (Array.isArray(value) && value.length > limit) {
            return `max ${limit} item`
        }
    },

    uniqueItems(value) {
        if (Array.isArray(value)) {
            const unique = new Set(value)
            if (unique.size !== value.length) {
                return 'item cannot be duplicated'
            }
        }
    },

    /* ======================
     * CONDITIONAL
     * ====================== */

    requiredIf(value, { field, equals }, payload) {
        if (payload?.[field] === equals && !value) {
            return 'field is required'
        }
    },

    requiredUnless(value, { field, equals }, payload) {
        if (payload?.[field] !== equals && !value) {
            return 'field is required'
        }
    },

    /* ======================
     * DATABASE (OPTIONAL)
     * ====================== */

    async unique(value, { model, field }) {
        if (!value) return
        const exists = await model.exists({ [field]: value })
        if (exists) {
            return 'already used'
        }
    },

    async exists(value, { model, field = '_id' }) {
        if (!value) return
        const exists = await model.exists({ [field]: value })
        if (!exists) {
            return 'data not found'
        }
    }
}
