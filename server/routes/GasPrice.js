const express = require('express');
const router = express.Router();
const db = require('../models/models');
require('dotenv').config();

/* GET */
//Get all prices
router.get("/", async (req, res) => {
    try {
        const gas = await db.GasPrice.findAll();
        res.json(gas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get price by location
router.get("/:location", async (req, res) => {
    try {
        const location = req.params.location;
        const gas = await db.GasPrice.findOne({where: {location: location}});
        res.json(gas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* POST */
router.post("/", async (req, res) => {
    try {
        //Get data
        const data = req.body;

        //Add to User
        const gas = await db.GasPrice.create({location: data?.location, averagePrice: data?.averagePrice});
        res.send(gas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* UPDATE */
router.put("/:location", async (req, res) => {
    try {
        //Get data
        const location = req.params.location;
        const data = req.body;
        const gas = await db.GasPrice.findOne({where: {location: location}});
        if (gas)
        {
            gas.set(data);
            await gas.save();
            res.send(gas);
        }
        else
        {
            res.status(404).send(`No gasPrice of location ${location}} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* DELETE */
router.delete("/:location", async (req, res) => {
    try {
        const location = req.params.location;
        const gas = await db.GasPrice.findOne({where: {location: location}});
        if (gas)
        {
            await gas.destroy();
            res.send(gas);
        }
        else
        {
            res.status(404).send(`No gasPrice of location ${location} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};