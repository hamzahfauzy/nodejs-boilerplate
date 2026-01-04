import { rules } from './rules.js'

export async function validate(payload, schema, context = {}) {
    const errors = {}

    for (const [field, validations] of Object.entries(schema)) {
        const value = payload[field]

        for (const rule of validations) {
            let name, param

            if (typeof rule === 'string') {
                name = rule
            } else {
                name = rule.name
                param = rule.value
            }

            const fn = rules[name]
            if (!fn) continue

            const error = await fn(value, param, payload, context)

            if (error) {
                errors[field] = field + ' ' + error
                break
            }
        }
    }

    if (Object.keys(errors).length) {
        return { valid: false, errors }
    }

    return { valid: true }
}
