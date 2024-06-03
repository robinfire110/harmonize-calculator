const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const striptags = require('striptags');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");

require('dotenv').config();

/* GET */
//Get price by location
router.get("/distance_matrix/:origin_zip/:destination_zip", async (req, res) => {
    try {
        const {origin_zip, destination_zip} = req.params;
        await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination_zip}&origins=${origin_zip}&region=us&units=imperial&key=${process.env.API_GOOGLE_MAPS}`).then(api_res => {
            res.json(api_res.data);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get location data by zip
router.get("/geocoding/zip/:zip", async (req, res) => {
    try {
        const {zip} = req.params;
        await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}}&key=${process.env.API_GOOGLE_MAPS}`).then(api_res => {
            res.json(api_res.data);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};