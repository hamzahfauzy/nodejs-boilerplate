export const rules = {

    /* ======================
     * BASIC
     * ====================== */

    required(value) {
        if (value === undefined || value === null || value === '') {
            return 'Field wajib diisi'
        }
    },

    nullable(value) {
        return
    },

    boolean(value) {
        if (typeof value !== 'boolean') {
            return 'Harus boolean'
        }
    },

    string(value) {
        if (value !== undefined && typeof value !== 'string') {
            return 'Harus string'
        }
    },

    number(value) {
        if (value !== undefined && typeof value !== 'number') {
            return 'Harus number'
        }
    },

    integer(value) {
        if (value !== undefined && !Number.isInteger(value)) {
            return 'Harus integer'
        }
    },

    array(value) {
        if (value !== undefined && !Array.isArray(value)) {
            return 'Harus array'
        }
    },

    object(value) {
        if (value !== undefined && typeof value !== 'object') {
            return 'Harus object'
        }
    },

    /* ======================
     * STRING
     * ====================== */

    min(value, limit) {
        if (value && value.length < limit) {
            return `Minimal ${limit} karakter`
        }
    },

    max(value, limit) {
        if (value && value.length > limit) {
            return `Maksimal ${limit} karakter`
        }
    },

    length(value, len) {
        if (value && value.length !== len) {
            return `Harus ${len} karakter`
        }
    },

    regex(value, pattern) {
        if (value && !new RegExp(pattern).test(value)) {
            return 'Format tidak sesuai'
        }
    },

    in(value, list) {
        if (value !== undefined && !list.includes(value)) {
            return `Harus salah satu dari ${list.join(', ')}`
        }
    },

    notIn(value, list) {
        if (value !== undefined && list.includes(value)) {
            return 'Nilai tidak diperbolehkan'
        }
    },

    /* ======================
     * FORMAT
     * ====================== */

    email(value) {
        if (!value) return
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!re.test(value)) {
            return 'Email tidak valid'
        }
    },

    url(value) {
        if (!value) return
        try {
            new URL(value)
        } catch {
            return 'URL tidak valid'
        }
    },

    date(value) {
        if (value && isNaN(Date.parse(value))) {
            return 'Tanggal tidak valid'
        }
    },

    /* ======================
     * NUMBER RANGE
     * ====================== */

    minValue(value, min) {
        if (value < min) {
            return `Minimal ${min}`
        }
    },

    maxValue(value, max) {
        if (value > max) {
            return `Maksimal ${max}`
        }
    },

    between(value, [min, max]) {
        if (value < min || value > max) {
            return `Harus antara ${min} - ${max}`
        }
    },

    /* ======================
     * ARRAY
     * ====================== */

    minItems(value, limit) {
        if (Array.isArray(value) && value.length < limit) {
            return `Minimal ${limit} item`
        }
    },

    maxItems(value, limit) {
        if (Array.isArray(value) && value.length > limit) {
            return `Maksimal ${limit} item`
        }
    },

    uniqueItems(value) {
        if (Array.isArray(value)) {
            const unique = new Set(value)
            if (unique.size !== value.length) {
                return 'Item tidak boleh duplikat'
            }
        }
    },

    /* ======================
     * CONDITIONAL
     * ====================== */

    requiredIf(value, { field, equals }, payload) {
        if (payload?.[field] === equals && !value) {
            return 'Field wajib diisi'
        }
    },

    requiredUnless(value, { field, equals }, payload) {
        if (payload?.[field] !== equals && !value) {
            return 'Field wajib diisi'
        }
    },

    /* ======================
     * DATABASE (OPTIONAL)
     * ====================== */

    async unique(value, { model, field }) {
        if (!value) return
        const exists = await model.exists({ [field]: value })
        if (exists) {
            return 'Sudah digunakan'
        }
    },

    async exists(value, { model, field = '_id' }) {
        if (!value) return
        const exists = await model.exists({ [field]: value })
        if (!exists) {
            return 'Data tidak ditemukan'
        }
    }
}
