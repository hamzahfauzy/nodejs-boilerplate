import { DataTypes } from "sequelize";

export default {
    name: 'document-share',
    schema: {
        fields: {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
    
            document_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },
    
            shared_with_user_id: {
                type: DataTypes.CHAR(24),
                allowNull: false
            },
    
            permission: {
                type: DataTypes.ENUM('view', 'edit'),
                allowNull: false,
                defaultValue: 'view'
            },
    
            created_at: {
                type: DataTypes.DATE
            }
        },
        options: {
            tableName: 'document_shares',
            timestamps: false
        }
    }
}