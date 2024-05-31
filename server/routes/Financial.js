const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const db = require('../models/models');
const { financialSchema } = require('../helpers/validators');
const { checkValidEventId, checkValidUserId, checkValidFinancialId } = require('../helpers/model-helpers');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");

const uid = new ShortUniqueId({ length: 16 });

/* GET */
//Get User Financial
router.get("/user_id/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        const financials = await db.Financial.findAll({include: {model: db.User, where: {user_id: id}, attributes: {exclude: ['password', 'isAdmin']}}});
        res.json(financials);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Financial by fin id
router.get("/fin_id/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        const financial = await db.Financial.findOne({where: {fin_id: id}, include: {model: db.User, attributes: {exclude: ['password', 'isAdmin']}}});
        
        //Check User
        if (!(req.user && (req.user.user_id == financial.Users[0].user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }
        
        res.json(financial);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Financial by user and fin id
router.get("/user_id/fin_id/:user_id/:fin_id", checkUser, async (req, res) => {
    try {
        const {user_id, fin_id} = req.params;

        //Check User
        if (!(req.user && (req.user.user_id == user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        const financials = await db.Financial.findAll({where: {fin_id: fin_id}, include: {model: db.User, where: {user_id: user_id}, attributes: {exclude: ['password', 'isAdmin']}}});
        res.json(financials);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Financial by user and event id
router.get("/user_id/event_id/:user_id/:event_id", checkUser, async (req, res) => {
    try {
        const {user_id, event_id} = req.params;
        //Check User
        if (!(req.user && (req.user.user_id == user_id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        const financials = await db.Financial.findAll({where: {event_id: event_id}, include: {model: db.User, where: {user_id: user_id}, attributes: {exclude: ['password', 'isAdmin']}}});
        res.json(financials);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* POST */
//Add new financial
//Required - fin_name, total_wage, event_hours, date
//Optional - hourly_wage, event_num, rehearse_hours, practice_hours, travel_hours, total_mileage, mileage_pay, zip, gas_price, mpg, tax, fees, event_id
router.post("/:id", checkUser, async (req, res) => {
    try {
        //Get data
        const id = req.params.id;
        console.log(id);
        const data = req.body;

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        //Validation
        const validUser = await checkValidUserId(id);
        const validEvent = data?.event_id ? await checkValidEventId(data?.event_id) : true;
        const {error} = financialSchema.validate(data)
        if (error || !validUser || !validEvent) 
        {
            if (!validUser) throw new Error("Not valid user id.")
            if (!validEvent) throw new Error("Not valid event id.")
            else
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }
        }

        //Add to User
        const newFinancial = await db.Financial.create({fin_id: uid.rnd(), fin_name: data?.fin_name, date: data?.date, total_wage: data?.total_wage, hourly_wage: data?.hourly_wage, event_num: data?.event_num, event_hours: data?.event_hours, rehearse_hours: data?.rehearse_hours, practice_hours: data?.practice_hours, travel_hours: data?.travel_hours, total_mileage: data?.total_mileage, mileage_pay: data?.mileage_pay, zip: data?.zip, gas_price: data?.gas_price, mpg: data?.mpg, tax: data?.tax, fees: data?.fees, event_id: data?.event_id, round_trip: data?.round_trip, multiply_pay: data?.multiply_pay, multiply_hours: data?.multiply_hours, multiply_travel: data?.multiply_travel, multiply_practice: data?.multiply_practice, multiply_rehearsal: data?.multiply_rehearsal, multiply_other: data?.multiply_other});
        const newFinStatus = await db.FinStatus.create({user_id: id, fin_id: newFinancial.fin_id});
        res.send(newFinancial);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* UPDATE */
router.put("/:id", checkUser, async (req, res) => {
    try {
        //Get data
        const id = req.params.id;
        const data = req.body;

        //Validate data
        const validFinancial = await checkValidFinancialId(id);
        const validEvent = data?.event_id ? await checkValidEventId(data?.event_id) : true;
        const {error} = financialSchema.validate(data)
        if (error || !validFinancial || !validEvent) 
        {
            if (!validFinancial) throw new Error("Not valid user id.")
            if (!validEvent) throw new Error("Not valid event id.")
            else
            {
                console.log(error);
                return res.status(403).send(error.details);;
            }
        }

        const financial = await db.Financial.findOne({where: {fin_id: id}, include: [{model: db.User, attributes: {exclude: ['password', 'isAdmin']}}]});
        if (financial)
        {
            //Check User
            if (!(req.user && (req.user.user_id == financial.Users[0].user_id || req.user.isAdmin == 1)))
            {
                throw new Error("Unauthorized access.");
            }

            financial.set(data);
            await financial.save();
            res.send(financial);
        }
        else
        {
            res.status(404).send(`No financial of fin_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* DELETE */
router.delete("/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;

        const financial = await db.Financial.findOne({where: {fin_id: id}, include: [{model: db.User, attributes: {exclude: ['password', 'isAdmin']}}]});
        if (financial)
        {
            //Check User
            if (!(req.user && (req.user.user_id == financial.Users[0].user_id || req.user.isAdmin == 1)))
            {
                throw new Error("Unauthorized access.");
            }
            await financial.destroy();
            res.send(financial);
        }
        else
        {
            res.status(404).send(`No financial of fin_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};