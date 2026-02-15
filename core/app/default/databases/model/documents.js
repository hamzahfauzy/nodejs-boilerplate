import { getCollection } from "#collection/collection.registry.js";
import { DataTypes } from "#database/database.sequelize.js";

const responseField = {
    id: {searchable: false},
    user_id: {searchable: false},
    parent_id: {searchable: false},
    name: {searchable: true},
    type: {},
    mime_type: {searchable: true},
    storage_path: {},
    created_at: {},
    updated_at: {},
    deleted_at: {},
}

export default {
    name: 'documents',
    schema: {
        fields: {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
    
            user_id: {
                type: DataTypes.CHAR(24),
                allowNull: false
            },
    
            parent_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true
            },
    
            type: {
                type: DataTypes.ENUM('folder', 'file'),
                allowNull: false
            },
    
            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
    
            // file-only fields
            mime_type: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
    
            size: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true
            },
    
            storage_path: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
    
            checksum: {
                type: DataTypes.CHAR(64),
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
            tableName: 'documents',
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        }
    },
    permissions: ['documents.list','documents.single','documents.create','documents.delete'],
    response: {
        list: responseField,
        single: responseField
    },
    hooks: {
        beforeCreate: async context => {
            const payload = {...context.payload}
            payload.type = payload.type ?? 'folder'
            payload.user_id = context.req.user._id.toString()

            if(payload.type == 'file')
            {
                const validate = await validateOrAbort(payload, {
                    file: ['required'],
                })
    
                if(validate.abort) return validate
                return validate
            }

            return { payload }

        },

        listData: async context => {
            let documents = context.data.data
            const userCollection = getCollection('users')

            const userIds = [...new Set(documents.map(d => d.user_id))];
            const users = await userCollection.model.find({
                _id: { $in: userIds }
            })
            .select('_id name')
            .lean();

            const userMap = Object.fromEntries(
                users.map(u => [u._id.toString(), u.name])
            );

            documents = documents.map(doc => ({
                ...doc,
                owner_name: userMap[doc.user_id] || null
            }));

            context.data.data = documents

            return {
                data: context.data
            }
        }
    }
}