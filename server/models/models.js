const {dbConfig, sequelize} = require("../config/database_config.js");
const { Sequelize } = require("sequelize");
const db = {};

db.Sequelize = Sequelize; //Sequelize parent objects. Holds Sequelize functions.
db.sequelize = sequelize; //Database connection objects. Used to add things to the database.

db.User = require("./user.model.js")(sequelize,Sequelize);
db.Event = require("./event.model.js")(sequelize,Sequelize);
db.Instrument = require("./instrument.model.js")(sequelize,Sequelize);
db.Address = require("./address.model.js")(sequelize, Sequelize, db.Event);
db.Financial = require("./financial.model.js")(sequelize,Sequelize, db.Event);
db.GasPrice = require("./gas_price.model.js")(sequelize,Sequelize);
db.EventInstrument = require("./event_instrument.model.js")(sequelize,Sequelize,db.Event,db.Instrument);
db.UserStatus = require("./user_status.model.js")(sequelize,Sequelize,db.User,db.Event);
db.FinStatus = require("./fin_status.model.js")(sequelize,Sequelize,db.User,db.Financial);
db.UserInstrument = require("./user_instrument.model.js")(sequelize,Sequelize,db.User,db.Instrument);

module.exports = db;
