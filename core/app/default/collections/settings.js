const responseFields = {
    _id: {},
    label: {searchable: true},
    key: {searchable: true},
    value: {searchable: true}
}

const settings = {
    name: 'settings',
    schema: {
        label: { type: String },
        key: { type: String, unique: true },
        value: { type: String }
    },
    permissions: ['settings.list'],
    response: {
        list: responseFields,
        single: responseFields
    },
}

export default settings