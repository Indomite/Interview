const Sequelize = require('sequelize');

const sequelize = new Sequelize('blog', 'root', '', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql',
    dialectOptions: { //字符集
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        supportBigNumbers: true,
        bigNumberStrings: true
    },

    pool: { //线程池
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    timezone: '+08:00' //东八区
})

module.exports = {
    sequelize
}