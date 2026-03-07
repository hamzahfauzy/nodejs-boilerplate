const responseFields = {
    _id: {},
    label: {searchable: true},
    key: {searchable: true},
    value: {searchable: true},
    createdAt: {},
    updatedAt: {},
}

const settings = {
    name: 'settings',
    schema: {
        fields: {
            label: { type: String },
            key: { type: String, unique: true },
            value: { type: String }
        },
        options: {
            timestamps: true
        }
    },
    permissions: ['settings.list','settings.create','settings.update','settings.delete'],
    response: {
        list: responseFields,
        single: responseFields
    },
}

export default settings