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
    size: {},
    readable_size: {
        value: row => row.size ? formatBytes(row.size) : '-'
    },
    file_url: {
        value: row => process.env.APP_URL + '/' + row.storage_path
    },
    created_at: {},
    updated_at: {},
    deleted_at: {},
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
                type: DataTypes.STRING(255),
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
        queryList: context => {
            if(!context.req.query.filters)
            {
                context.req.query.filters = {parent_id: null}
            }

            context.req.query.order = {
                column: 'type',
                dir: 'desc'
            }
            
            return context.req.query
        },
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
        },

        singleData: async context => {
            let document = {...context.data}
            const userCollection = getCollection('users')

            const userIds = document.user_id;
            const user = await userCollection.model.findOne({
                _id: userIds
            });

            document.owner_name = user.name

            context.data = document

            return {
                data: context.data
            }
        }
    }
}