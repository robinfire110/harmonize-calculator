const {Sequelize} = require('sequelize');

// Function to connect to the database
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        logging: true,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_CONNECTION,
        define: {
            freezeTableName: true,
            timestamps: false,
            underscored: true
        }
    }
);

//Connect to database
const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        //if (sequelize == local_database) console.log("Successfully connected to LOCAL database.");
        console.log("Successfully connected to REMOTE database.")
    }
    catch (error) {
        console.error(error);
    }
    return sequelize;
}

//Export for use in other files
module.exports = {sequelize, connectToDatabase};
