const responseFields = {
    _id: {},
    label: {searchable: true},
    key: {searchable: true},
    plugin: {searchable: true},
    description: {searchable: true},
    createdAt: {},
    updatedAt: {},
}

const permissions = {
    name: 'permissions',
    schema: {
        fields: {
            label: String,
            key: { type: String, unique: true },
            plugin: String,
            description: String
        },
        options: {
            timestamps: true
        }
    },
    permissions: ['permissions.list','permissions.single','permissions.create','permissions.update','permissions.delete'],
    response: {
        list: responseFields,
        single: responseFields
    },
}

export default permissions