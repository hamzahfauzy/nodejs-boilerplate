import { DataTypes } from "#database/database.sequelize.js";

const responseField = {
    id: { searchable: false },
    name: { searchable: true },
    record_type: { searchable: true },
    created_at: {},
    updated_at: {},
    deleted_at: {}
}

const validation = {
    name: ['required'],
    record_type: ['required'],
}

export default {
    name: 'categories',
    schema: {
        fields: {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },

            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            record_type: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            
            created_at: {
                type: DataTypes.DATE
            },

            updated_at: {
                type: DataTypes.DATE
            },

            deleted_at: {
                type: DataTypes.DATE
            }
        },
        options: {
            tableName: 'categories',
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    },

    permissions: [
        'categories.list',
        'categories.single',
        'categories.create',
        'categories.update',
        'categories.delete'
    ],

    response: {
        list: responseField,
        single: responseField
    },

    validation: {
        create: validation,
        update: validation,
    }
}