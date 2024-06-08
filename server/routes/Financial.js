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

        const financials = await db.Financial.findAll({include: {model: db.User, where: {user_id: id}, attributes: []}});
        res.json(financials);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Get Financial by fin id
router.get("/fin_id/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        const financial = await db.Financial.findOne({where: {fin_id: id}, include: {model: db.User, attributes: ['user_id']}});
        
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

        const financials = await db.Financial.findAll({where: {fin_id: fin_id}, include: {model: db.User, where: {user_id: user_id}, attributes: ['user_id']}});
        res.json(financials);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* POST */
//Add new financial
//Required - fin_name, total_wage, event_hours, date
//Optional - hourly_wage, event_num, rehearsal_hours, practice_hours, travel_hours, total_mileage, mileage_covered, zip, gas_price, mpg, tax, fees, event_id
router.post("/:id", checkUser, async (req, res) => {
    try {
        //Get data
        const id = req.params.id;
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
        console.log(data);
        const newFinancial = await db.Financial.create({fin_id: uid.rnd(), ...data});
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

        const financial = await db.Financial.findOne({where: {fin_id: id}, include: [{model: db.User, attributes: ['user_id']}]});
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
//To delete multiple, separate with "|"
router.delete("/:id", checkUser, async (req, res) => {
    try {
        const id = (req.params.id).split("|");
        const whereClause = {where: {fin_id: id}, include: [{model: db.User, where: {user_id: req.user.user_id}, attributes: ['user_id']}]};

        const financial = await db.Financial.findAll(whereClause);
        if (financial)
        {
            //Check User Access
            financial.forEach(fin => {
                if (!(req.user && (req.user.user_id == fin.Users[0].user_id)))
                {
                    throw new Error("Unauthorized access.");
                }
            });
            
            //Destroy
            await db.Financial.destroy(whereClause)
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