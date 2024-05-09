const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const striptags = require('striptags');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");

require('dotenv').config();

/* GET */
router.get("/test", async (req, res) => {
    console.log(req);
    res.send("goog");
});

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

/* POST */
const emailQueue = []; //Used to track email requests and not get concurrent connection error
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secure: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
        user: "harmonizeapp@outlook.com",
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        ciphers:'SSLv3'
    }
});
//Send Mail
router.post("/email", checkUser, async (req, res) => {
    try {
        //Check for user
        if (!req.user)
        {
            throw new Error("Unauthorized access.");
        }

        //Add to queue
        const intialLength = emailQueue.length;

        if (!req.body.to.includes("@test.com"))
        {
            emailQueue.push(req.body);
            if (intialLength-1 <= 0) sendEmail();
            console.log(`Email to ${req.body.to} added to queue.`)
            res.status(200).send(`Email to ${req.body.to} added to queue.`);
        }
        else
        {
            console.log(`Testing email detected, not added to queue.`)
            res.status(200).send(`Testing email detected, not added to queue.`);
        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function sendEmail()
{
    const data = emailQueue[0];
    if (data)
    {   
        try {
            //Filter data (strip HTML tags)
            const includeTags = ['br', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'hr', 'small']
            if (data?.text) data.text = striptags(data.text, includeTags);
            if (data?.html) data.html = striptags(data.html, includeTags);

            const info = await transporter.sendMail({
                from: 'Harmonize <harmonizeapp@outlook.com>',
                to: data.to,
                replyTo: data?.replyTo ? data.replyTo : "noreply@harmonize.rocks",
                subject: data.subject,
                text: data?.text,
                html: data?.html
            }).then(() => {
                emailQueue.shift();
                console.log(`Email sent to ${data.to}.`);
                if (emailQueue.length > 0) setTimeout(() => sendEmail(), 250); //Allows time for connection to free up (helps avoid errors)
            });
        } catch (error) {
            console.log(error);
        }
       
    }
}


//Export
module.exports = {router};