const {dbConfig, sequelize} = require("../config/database_config.js");
const { Sequelize } = require("sequelize");
const db = {};

db.Sequelize = Sequelize; //Sequelize parent objects. Holds Sequelize functions.
db.sequelize = sequelize; //Database connection objects. Used to add things to the database.

db.User = require("./user.model.js")(sequelize,Sequelize);
db.Financial = require("./financial.model.js")(sequelize,Sequelize, db.Event);
db.GasPrice = require("./gas_price.model.js")(sequelize,Sequelize);
db.FinStatus = require("./fin_status.model.js")(sequelize,Sequelize,db.User,db.Financial);

module.exports = db;
