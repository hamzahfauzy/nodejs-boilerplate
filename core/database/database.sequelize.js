import { Sequelize, DataTypes } from 'sequelize'

export const sequelize = new Sequelize(
    process.env.MYSQL_NAME,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASS,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,

        dialectOptions: {
            multipleStatements: true
        }
    }
)

export { DataTypes }
