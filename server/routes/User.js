const express = require('express');
const router = express.Router();
const {getInstrumentId, instrumentArrayToIds, checkValidUserId} = require("../helpers/model-helpers");
const db = require('../models/models');
const { userSchema, instrumentSchema } = require('../helpers/validators');
const Joi = require('joi');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");
const { Op } = require('sequelize');

//Varaibles
const userSensitiveAttributes = ['password', 'isAdmin'];

/* GET */
//Get all
//Returns JSON of all users
//Must be admin to use
router.get("/", checkUser, async (req, res) => {
    try {
        //Check for admin
        if (req.user.isAdmin == 1)
        {
            const users = await db.User.findAll({attributes: ["user_id", "email", "is_admin"]});
            res.json(users);
        }
        else throw new Error("Unauthorized access.");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get single by ID
//Returns JSON of user with given user_id. Will be empty if does not exist.
router.get("/id/:id", checkUserOptional, async (req, res) => {
    try {
        const id = req.params.id;
        //Check user to change attributes returned (if not user or admin, only return non-sensitive attributes); 
        let attributes = {exclude: userSensitiveAttributes}
        if (req.user && (req.user.user_id == id || req.user.isAdmin == 1))
        {
            attributes = {exclude: ['password']}
            include = [db.Financial];
        } 
        const user = await db.User.findOne({where: {user_id: id}, attributes: attributes, include: include});
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Check email
//Returns true if email exists, false otherwise
router.get("/email/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const user = await db.User.findOne({where: {email: email}, attributes: ["user_id", "email"]});
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get single by email
//Returns JSON of user with given email. Will be empty if does not exist.
//Commented out because we never use it and securing it is more difficult
/*
router.get("/email/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const user = await db.User.findOne({where: {email: email}, include: [db.Instrument, db.Event]});
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
*/

/* POST */
//Add new user
//Required - email, password, name, zip
//Optional - Bio, is_admin (default: false), instrument(s)
//Instrument can be either name or ID. Can mix and match.
router.post("/", async (req, res) => {
    try {
        //Get data
        const data = req.body;

        //Validate
        data.instruments = await instrumentArrayToIds(data?.instruments);
        const {error} = userSchema.validate(data)
        if (error) 
        {
            console.log(error);
            return res.status(403).send(error.details);;
        }

        //Add to User
        const newUser = await db.User.create({email: data?.email, password: data?.password, name: data?.name, zip: data?.zip, bio: data?.bio, is_admin: data?.is_admin});

        //Add instrument (adds relation to UserInstrument table)
        newInstrumentArray = [];
        if (data.instruments)
        {
            for (const instrument of data.instruments) {
                //Add if found
                if (instrumentId)
                {
                    newInstrument = await db.UserInstrument.create({instrument_id: instrumentId, user_id: newUser.user_id});
                    newInstrumentArray.push(newInstrument);
                }
                else
                {
                    console.log("Instrument not found. Possibly incorrect ID or name?. Skipping instrument");
                }
            }
        }
        res.send({newUser, newInstrumentArray});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Add instrument
//Adds instrumet(s) to user with associated user_id
router.post("/instrument/:id", checkUser, async (req, res) => {
    try {
        //Get data
        const data = req.body;
        const id = req.params.id;

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Validation
        if (data?.instruments)
        {
            data.instruments = await instrumentArrayToIds(data?.instruments);        
            const validUserId = await checkValidUserId(id);
            const {error, value} = (Joi.object({instruments: instrumentSchema})).validate(data);
            if (error || !validUserId) 
            {
                if (!validUserId) throw new Error("Not valid user id");
                console.log(error);
                return res.status(403).send(error.details);;
            }
            
            //Add instrument (adds relation to UserInstrument table)
            newInstrumentArray = [];
            if (data.instruments)
            {
                for (const instrument of data.instruments) {
                    //Add if found
                    if (instrumentId)
                    {
                        newInstrument = await db.UserInstrument.findOrCreate({where: {instrument_id: instrumentId, user_id: id}});
                        newInstrumentArray.push(newInstrument);
                    }
                    else
                    {
                        console.log("Instrument not found. Possibly incorrect ID or name?. Skipping instrument");
                    }
                    
                }
            }
            res.send({newInstrumentArray});
        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* UPDATE */
//Update user
//Can update fields. Only need to send the fields you wish to update
router.put("/:id", checkUser, async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        const user = await db.User.findOne({where: {user_id: id}, attributes: {exclude: userSensitiveAttributes}});
        if (user)
        {
            //Update user
            user.set(data);
            console.log("Updated user")
            await user.save();
        }
        else
        {
            res.status(404).send(`No user of user_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Update instrument
//Updates instrumet(s) to user with associated user_id
//WILL DELETE OLD ENTIRES AND UPDATE ENTIRELY WITH NEW ONES. If you need to only add or delete one instrument, use the POST and DELETE requests instead.
router.put("/instrument/:id", checkUser, async (req, res) => {
    try {
        //Get data
        const data = req.body;
        const id = req.params.id;

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Add instrument (adds relation to UserInstrument table)
        newInstrumentArray = [];
        if (data.instruments)
        {
             //Delete old entries
            await db.UserInstrument.destroy({where: {user_id: id}});
            
            for (const instrument of data.instruments) {
                //Get instrumentId
                let instrumentId = await getInstrumentId(instrument);
                
                //Add if found
                if (instrumentId)
                {
                    newInstrument = await db.UserInstrument.findOrCreate({where: {instrument_id: instrumentId, user_id: id}});
                    newInstrumentArray.push(newInstrument);
                }
                else
                {
                    console.log("Instrument not found. Possibly incorrect ID or name?. Skipping instrument");
                }
            }
        }
        else
        {
            throw {message: "No instrument object given."};
        }
        res.send({newInstrumentArray});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* DELETE */
//Delete user
router.delete("/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await db.User.findOne({where: {user_id: id}, include: [db.Event, db.Financial], attributes: {exclude: userSensitiveAttributes}});

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (user)
        {
            //Destroy events
            user.Events.forEach(async event => {
                //If owner, delete
                if (event.UserStatus.status == "owner")
                {
                    await event.destroy();
                }
            });

            //Destroy Financial
            user.Financials.forEach(async financial => {
                //If financial exists, delete
                await financial.destroy();
            });

            await user.destroy();
            res.send(user);
        }
        else
        {
            res.status(404).send(`No user of user_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Delete instrument
router.delete("/instrument/:user_id/:instrument_id?", checkUser, async (req, res) => {
    try {
        const {user_id, instrument_id} = req.params;
        const instrument = await db.UserInstrument.findOne({where: {user_id: user_id, instrument_id: instrument_id}});

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (instrument)
        {
            await instrument.destroy();
            res.send(instrument);
        }
        else
        {
            res.status(404).send(`No instrument of user_id ${user_id} and instrument_id ${instrument_id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};