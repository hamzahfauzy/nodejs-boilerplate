import { validate } from './validator.js'

export async function validateOrAbort(payload, schema) {
    const result = await validate(payload, schema)

    if (!result.valid) {
        return {
            abort: true,
            status: 422,
            message: 'Validation failed',
            errors: result.errors
        }
    }

    return { payload }
}
