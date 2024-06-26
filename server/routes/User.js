const express = require('express');
const router = express.Router();
const {checkValidUserId} = require("../helpers/model-helpers");
const db = require('../models/models');
const { userSchema } = require('../helpers/validators');
const Joi = require('joi');
const {checkUser, checkUserOptional} = require("../Middleware/AuthMiddleWare");
const { Op } = require('sequelize');

//Varaibles
const userSensitiveAttributes = ['isAdmin'];

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

//Get stats
//Must be admin to use
//Get number of financials
//Must be admin to use
router.get("/stats", checkUser, async (req, res) => {
    try {
        //Check User
        if (!(req.user && req.user.isAdmin == 1))
        {
            throw new Error("Unauthorized access.");
        }

        const userCount = await db.User.count();
        const finCount = await db.Financial.count();
        res.json({user_count: userCount, fin_count: finCount, average_fin: finCount/userCount});
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
        if (req.user && (req.user.user_id == id || req.user.isAdmin == 1))
        {
            include = [db.Financial];
        } 
        const user = await db.User.findOne({where: {user_id: id}, include: include});
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* POST */
//Add new user
//Required - email
//Replaced by login in AuthRoutes
/*
router.post("/", async (req, res) => {
    try {
        //Get data
        const data = req.body;

        //Add to User
        const newUser = await db.User.create({email: data?.email, name: data?.name, zip: data?.zip, bio: data?.bio, is_admin: data?.is_admin});

        res.send({newUser});
    } catch (error) {
        res.status(500).send(error.message);
    }
});
*/

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
            await user.save();
            res.status(200).send("User Updated");
        }
        else
        {
            res.status(404).send(`No user of user_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* DELETE */
//Delete user
router.delete("/:id", checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await db.User.findOne({where: {user_id: id}, include: [db.Financial], attributes: {exclude: userSensitiveAttributes}});

        //Check User
        if (!(req.user && (req.user.user_id == id || req.user.isAdmin == 1)))
        {
            throw new Error("Unauthorized access.");
        }

        if (user)
        {
            //Destroy Financial
            user.Financials.forEach(async financial => {
                //If financial exists, delete
                await financial.destroy();
            });

            await user.destroy();
            res.status(200).send(user);
        }
        else
        {
            res.status(404).send(`No user of user_id ${id} found.`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Export
module.exports = {router};