const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize, connectToDatabase } = require('./config/database_config');
const db = require('./models/models');
const {
    getGasPrices,
} = require("./helpers/model-helpers");

// Middleware to log request headers

const { router: authRoutes } = require('./routes/AuthRoutes');
const routeFinancial = require('./routes/Financial');
const routeUser = require('./routes/User');
const routeGas = require('./routes/GasPrice');
const routeAPI = require('./routes/API');

const app = express();
const port = process.env.port || 5000;

//Allowed origins
const allowedOrigins = []
if (process.env.NODE_ENV === "development")
{
    allowedOrigins.push("http://localhost:3000");
}
else if (process.env.NODE_ENV === "production")
{
    allowedOrigins.push(`https://${process.env.SITE_URL}`);
    allowedOrigins.push(`http://${process.env.SITE_URL}`);
    allowedOrigins.push(`http://${process.env.SERVER_IP}`);
}

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: allowedOrigins,
    exposedHeaders: 'Set-Cookie',
    method: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(cookieParser());

//Gas price automation
//Will run at 4am every day.
const gasPricePull = schedule.scheduleJob({tz: "America/New_York", hour: 8, minute: 0, second: 0}, () => {
    console.log("Getting Gas Price", new Date());
    getGasPrices();
});

// Database setup
app.listen(port, async () => {
    await connectToDatabase();
    await sequelize.sync({ alter: true });

    //Run Scripts
    console.log(`Server is running at http://localhost:${port}`);
});

// Routes setup
app.use("/financial", routeFinancial.router);
app.use("/user", routeUser.router);
app.use("/gas", routeGas.router);
app.use("/api", routeAPI.router);
app.use(authRoutes);

