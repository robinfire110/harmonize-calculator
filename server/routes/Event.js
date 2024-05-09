const express = require('express');
const router = express.Router();
const db = require('../models/models');
const {getEventHours, getInstrumentId, checkValidUserId, checkValidEventId, instrumentArrayToIds, updateUnlistedData} = require('../helpers/model-helpers');
const {sequelize} = require('../config/database_config');
const { Op, where } = require('sequelize');
const { eventSchema, addressSchema, addUserToEventSchema, instrumentSchema } = require('../helpers/validators');
const Joi = require('joi');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");

/* GET */
//Get all
//Returns JSON of all events
//?exclude_user=# (exclude events from user of id provided)
//Only returns the owner of the event. If you want to see all associated users, you have to check individual event.
router.get("/", async (req, res) => {
    try {
        //Update unlisted
        updateUnlistedData();

        //Exclude user 
        const exclude_user = req.query?.exclude_user;
        const userWhere = exclude_user ? {model: db.User, where: {user_id: {[Op.ne]: exclude_user}, $status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}} : {model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}};
                
        const events = await db.Event.findAll({include: [db.Instrument, db.Address, userWhere]});

        res.json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get single by ID
//Returns JSON of event with given event_id. Will be empty if does not exist.
router.get("/id/:id", checkUserOptional, async (req, res) => {
    try {
        const id = req.params.id;
        
        //Update unlisted
        updateUnlistedData(id);

        //All
        let event = await db.Event.findOne({where: {event_id: id}, include: [db.Instrument, db.Address, {model: db.User, where: {[Op.or]: [{$status$: "owner"}]}, attributes: {exclude: ['password', 'isAdmin']}}]});
        
        //No Owner fix (some of the faker data doesn't have owners, so we need to query again in that case)
        if (!event)
        {
            event = await db.Event.findOne({where: {event_id: id}, include: [db.Instrument, db.Address]});
        }

        //Check user (if owner, give full data)
        if (req.user)
        {
            //If owner
            if ((event?.Users.length > 0 && req.user.user_id == event?.Users[0].user_id) || req.user.isAdmin == 1)
            {
                event = await db.Event.findOne({where: {event_id: id}, include: [db.Instrument, db.Address, {model: db.User, attributes: {exclude: ['password', 'isAdmin']}}]});
            }   
            else
            {
                //If associated, but not owner, return that users data as well.
                event = await db.Event.findOne({where: {event_id: id}, include: [db.Instrument, db.Address, {model: db.User, where: {[Op.or]: [{$status$: "owner"}, {user_id: req.user.user_id}]}, attributes: {exclude: ['password', 'isAdmin']}}]});//If associated  
            }            
        }

        res.json(event);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get event by instrument(s)
//Returns event associated with pass instrument(s) ids. Instrument separated by |.
//Will only return listed events
//?sort=true (allows to return sorted by date posted)
//?limit=# (limit the result number)
//?exclude_user=# (exclude events from user of id provided)
router.get("/instrument/:id", async (req, res) => {
    try {
        const id = req.params.id.split("|");
        const isSorted = req.query.sort; //Sort by date posted
        const exclude_user = req.query?.exclude_user;
        const limit = req.query?.limit ? req.query.limit : 999;

        //Update unlisted
        updateUnlistedData();

        //Set clauses
        const sortOrder = isSorted ? [['date_posted', 'DESC']] : [];
        const userWhere = exclude_user ? {model: db.User, where: {user_id: {[Op.ne]: exclude_user}, $status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}} : {model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}};
        
        //Search
        let event = await db.Event.findAll({include: [{model: db.Instrument, where: {[Op.or]: {instrument_id: id}}}, db.Address, userWhere], where: {is_listed: true}, order: sortOrder, limit: sequelize.literal(limit)});
        console.log(id);
        console.log(event);
        res.json(event);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Event by user_id and event_id
//Need to pass token to see event details if owner=false
router.get("/user_id/event_id/:user_id/:event_id", checkUserOptional, async (req, res) => {
    try {
        const {user_id, event_id} = req.params;
        if (req.user && (req.user.user_id == user_id || req.user.isAdmin == 1))
        {
            //Update unlisted
            updateUnlistedData(event_id);

            let event = await db.Event.findAll({where: {event_id: event_id}, include: [{model: db.User, where: {user_id: user_id}, attributes: {exclude: ['password', 'isAdmin']}}, db.Instrument, db.Address]});
            res.json(event);
        }
        else throw new Error("Unauthorized access.");

    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get most recent events (a given number)
//Will return only listed events
//?exclude_user
router.get("/recent/:limit", async (req, res) => {
    try {
        //Update unlisted
        updateUnlistedData();

        const limit = req.params.limit;
        const exclude_user = req.query?.exclude_user;
        const events = await db.Event.findAll({include: [db.Instrument, db.Address, exclude_user ? ({model: db.User, where: {user_id: {[Op.ne]: exclude_user}, $status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}) : ({model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}})], order: [['date_posted', 'DESC']], limit: sequelize.literal(limit), where: {is_listed: true}});
        res.json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get soonest events (a given number)
router.get("/soonest/:limit", async (req, res) => {
    try {
        //Update unlisted
        updateUnlistedData();

        const limit = req.params.limit;
        const userWhere = req.query?.exclude_user ? {model: db.User, where: {user_id: {[Op.ne]: exclude_user}, $status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}} : {model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}};
        const events = await db.Event.findAll({include: [db.Instrument, db.Address, userWhere], order: [['start_time', 'ASC']], limit: sequelize.literal(limit), where: {is_listed: true}});
        res.json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Address by event_id
/*
router.get("/address/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const address = await db.Address.findOne({where: {event_id: id}});
        res.json(address);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
*/

/* POST */
//Add new event
//Required - event_name, start_time, end_time, pay, address, user_id
//Calculated - date_posted, event_hours
//Optional - description, rehearse_hours, mileage_pay, is_listed, instruments
//Instrument can be either name or ID. Can mix and match.
router.post("/", checkUser, async (req, res) => {
    try {
        //Get data
        const data = req.body;
        const addressData = data.address;
        //console.log(data);

        //Check user
        if (!(req.user && (req.user.user_id == data.user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Set data values
        //Get calculated values
        if (data.start_time || data.end_time)
        {
            data.event_hours = getEventHours(data.start_time ? data.start_time : event.start_time, data.end_time ? data.end_time : event.end_time);
        }

        //Convert instrument to only ids (if used names)
        data.instruments = await instrumentArrayToIds(data?.instruments);

        //Validation
        const validUser = await checkValidUserId(data?.user_id);
        const {error} = eventSchema.validate(data)
        if (error || !validUser) 
        {
            if (!validUser) throw new Error("Not valid user_id.")
            else
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }
        }

        //Add to event & address
        const newEvent = await db.Event.create({event_name: data?.event_name, start_time: data?.start_time, end_time: data?.end_time, pay: data?.pay, address: data?.address, event_hours: data?.event_hours, description: data?.description, rehearse_hours: data?.rehearse_hours, mileage_pay: data?.mileage_pay});
        const newAddress = await db.Address.create({event_id: newEvent.event_id, street: addressData?.street, city: addressData?.city, zip: addressData?.zip, state: addressData?.state});
        const newStatus = await db.UserStatus.create({user_id: data?.user_id, event_id: newEvent.event_id, status: "owner"});

        //Add instrument (adds relation to EventInstrument table)
        const newInstrumentArray = [];
        if (data.instruments)
        {
            for (const instrument of data.instruments) {
                //Add if found
                if (instrument)
                {
                    var newInstrument = await db.EventInstrument.create({instrument_id: instrument, event_id: newEvent.event_id});
                    newInstrumentArray.push(newInstrument);
                }
                else
                {
                    console.log("Instrument not found. Possibly incorrect ID or name?. Skipping instrument");
                }
            }
        }

        //Send back
        res.send({newEvent, newInstrumentArray, newAddress, newStatus});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Add users to event
router.post("/users/:event_id/:user_id", checkUser, async (req, res) => {
    try {
        //Get data
        const data = req.body;
        const {event_id, user_id} = req.params;

        //Check user
        if (!(req.user && (req.user.user_id == user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Validation (check if ids are valid)
        const validEventId = await checkValidEventId(event_id);
        const validUserId = await checkValidUserId(user_id);
        const {error, value} = addUserToEventSchema.validate(data)
        if (error || !validEventId || !validUserId) 
        {
            if (!validEventId) throw new Error("Invalid event id.");
            else if (!validUserId) throw new Error("Invalid user id.");
            else
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }
        }

        //Get event
        const newStatus = await db.UserStatus.findOrCreate({where :{user_id: user_id, event_id: event_id, status: data?.status}});

        res.send({newStatus});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Add instrument
//Adds instrumet(s) to event with associated event_id
/*
router.post("/instrument/:id", async (req, res) => {
    try {
        //Get data
        const data = req.body;
        const id = req.params.id;

        //Validation
        if (data?.instruments)
        {
            //Add instrument (adds relation to UserInstrument table)
            data.instruments = await instrumentArrayToIds(data?.instruments);

            //Validation
            const {error, value} = (Joi.object({instruments: instrumentSchema})).validate(data);
            if (error) 
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }

            //Add
            const returnArray = []
            for (const instrument of data.instruments) {
                //Add if found
                if (instrument)
                {
                    newInstrument = await db.EventInstrument.findOrCreate({where: {instrument_id: instrument, event_id: id}});
                    returnArray.push(newInstrument);
                }
            }
            res.send({returnArray});
        }
        else throw new Error("No instrument array provided")
    } catch (error) {
        res.status(500).send(error.message);
    }
});
*/

/* UPDATE */
//Can update fields. Only need to send the fields you wish to update
router.put("/:id", checkUser, async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;
        const event = await db.Event.findOne({where: {event_id: id}, include: [{model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}, db.Address]});

        //Check user
        if (!(req.user && (req.user.user_id == event?.Users[0].user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (event)
        {
            //Recalculate Event Time (if needed)
            if (data.start_time || data.end_time)
            {
                event_hours = getEventHours(data.start_time ? data.start_time : event.start_time, data.end_time ? data.end_time : event.end_time);
                data.event_hours = event_hours;
            }

            //Set instruments
            data.instruments = await instrumentArrayToIds(data?.instruments);

            //Validate
            //Delete values that will not be updated (not in schema)
            if (data?.event_id) delete data.event_id; 
            if (data?.date_posted) delete data.date_posted; 
            if (data?.Users) delete data.Users; 
            if (data?.Address) delete data.Address; 
            if (data?.Instruments) delete data.Instruments; 
            const {error} = eventSchema.fork(['user_id', 'start_time', 'end_time', 'event_name', 'pay', 'description', 'event_hours', 'rehearse_hours', 'mileage_pay', 'is_listed'], (schema) => schema.optional()).validate(data)
            if (error) 
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }

            //Set Instruments (if exists)
            newInstrumentArray = [];
            if (data.instruments)
            {
                //Delete old entries
                await db.EventInstrument.destroy({where: {event_id: id}});

                for (const instrument of data.instruments) {
                    //Get instrumentId
                    let instrumentId = await getInstrumentId(instrument);
                    
                    //Add if found
                    if (instrumentId)
                    {
                        newInstrument = await db.EventInstrument.findOrCreate({where: {instrument_id: instrumentId, event_id: event.event_id}});
                        newInstrumentArray.push(newInstrument);
                    }
                    else
                    {
                        console.log("Instrument not found. Possibly incorrect ID or name?. Skipping instrument");
                    }
                }
            }

            //Set Address (if exists)
            if (data.address)
            {
                const address = await db.Address.findOne({where: {address_id: event.Address.address_id}});
                address.set(data.address);
                await address.save();
            }

            //Set Data
            event.set(data);

            //Save
            await event.save();
            res.send({event, newInstrumentArray});
        }
        else
        {
            res.status(404).send(`No event of event_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Update event user status
router.put("/users/:event_id/:user_id", checkUser, async (req, res) => {
    try {
        const data = req.body;
        const {event_id, user_id} = req.params;
        const status = await db.UserStatus.findOne({where: {event_id: event_id, user_id: user_id}});
        const event = await db.Event.findOne({where: {event_id: event_id}, include: [{model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}]});
        
        //Check user
        if (!(req.user && (req.user.user_id == user_id || req.user.user_id == event?.Users[0].user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Validation (check if ids are valid)
        const validEventId = await checkValidEventId(event_id);
        const validUserId = await checkValidUserId(user_id);
        const {error, value} = addUserToEventSchema.validate(data)
        if (error || !validEventId || !validUserId) 
        {
            if (!validEventId) throw new Error("Invalid event id.");
            else if (!validUserId) throw new Error("Invalid user id.");
            else
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }
        }
        
        //Set Data
        if (status)
        {
            status.set(data);
            await status.save();
            res.send(status);
        }
        else
        {
            res.status(404).send(`No user_id ${user_id} found in relation to event of event_id ${event_id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const event = await db.Event.findOne({where: {event_id: id}, include: [{model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}]});

        //Check user
        if (!(req.user && (req.user.user_id == event?.Users[0].user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (event)
        {
            await event.destroy();
            res.send(event);
        }
        else
        {
            res.status(404).send(`No event of event_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Delete user
router.delete("/user/:event_id/:user_id", async (req, res) => {
    try {
        const {event_id, user_id} = req.params;
        const status = await db.UserStatus.findOne({where: {event_id: event_id, user_id: user_id}});
        const event = await db.Event.findOne({where: {event_id: event_id}, include: [{model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}]});

        //Check user
        if (!(req.user && (req.user.user_id == event?.Users[0].user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (status)
        {
            await status.destroy();
            res.send(status);
        }
        else
        {
            res.status(404).send(`No user_id ${user_id} associated with event of event_id ${event_id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Delete instrument
router.delete("/instrument/:event_id/:instrument_id", async (req, res) => {
    try {
        const {event_id, instrument_id} = req.params;
        const instrument = await db.EventInstrument.findOne({where: {event_id: event_id, instrument_id: instrument_id}});
        const event = await db.Event.findOne({where: {event_id: event_id}, include: [{model: db.User, where: {$status$: "owner"}, attributes: {exclude: ['password', 'isAdmin']}}]});

        //Check user
        if (!(req.user && (req.user.user_id == event?.Users[0].user_id || req.user.isAdmin == 1)))
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
            res.status(404).send(`No instrument of event_id ${event_id} and instrument_id ${instrument_id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};