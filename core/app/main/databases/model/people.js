import { DataTypes } from "#database/database.sequelize.js";

const responseField = {
    id: { searchable: false },
    code: { searchable: true },
    first_name: { searchable: true },
    last_name: { searchable: true },
    full_name: { searchable: true },
    name: {
        value: row => row.full_name
    },
    email: { searchable: true },
    phone: { searchable: true },
    gender: {},
    birth_date: {},
    birth_place: {},
    address: {},
    identity_number: {},
    city: {},
    postal_code: {},
    state: {},
    country: {},
    status: {},
    created_at: {},
    updated_at: {},
    deleted_at: {}
}

export default {
    name: 'people',
    schema: {
        fields: {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },

            code: {
                type: DataTypes.STRING(50),
                allowNull: true,
                unique: true
            },

            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            last_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            full_name: {
                type: DataTypes.STRING(200),
                allowNull: true
            },

            gender: {
                type: DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true
            },

            birth_date: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },

            birth_place: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            email: {
                type: DataTypes.STRING(150),
                allowNull: true,
                unique: true
            },

            phone: {
                type: DataTypes.STRING(50),
                allowNull: true
            },

            address: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            city: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            state: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            postal_code: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            country: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            identity_number: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            photo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            status: {
                type: DataTypes.ENUM('active','inactive','deceased','archived'),
                defaultValue: 'active'
            },

            metadata: {
                type: DataTypes.JSON,
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
            tableName: 'people',
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    },

    permissions: [
        'people.list',
        'people.single',
        'people.create',
        'people.update',
        'people.delete'
    ],

    response: {
        list: responseField,
        single: responseField
    },
}