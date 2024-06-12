const {checkUser} = require("../Middleware/AuthMiddleWare");
const db = require("../models/models");
const jwt = require('jsonwebtoken');
const {jwtDecode} = require('jwt-decode');
const router = require("express").Router();

//Create token
const daysTillExpire = 30;
const maxAge = daysTillExpire*24*60*60;
const createToken = (id) => {
	return jwt.sign({ id }, process.env.SECRET, {
		expiresIn: maxAge,
	});
}

//Login
router.post("/login", async (req, res) => {
    try {
		const { credential } = req.body;
		const googleToken = jwtDecode(credential);
		const user = await db.User.findOrCreate({raw: true, where: {email: googleToken.email}});
		if (user) {
			const userData = user[0];
			const token = createToken(userData.user_id);
			res.cookie("jwt", token, {
				withCredentials: true,
				httpOnly: false,
				maxAge: maxAge * 1000,
			});
			res.status(200).json({ isNewUser: user[1]});
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (err) {
		console.error(err);
		res.json({err, created: false});
	}
});

//Get account data (from cookie)
router.get("/account", checkUser, async (req, res) => {
    try {
		const userToSend = {};
		if (req.user.user_id) userToSend.user_id = req.user.user_id;
		if (req.user.email) userToSend.email = req.user.email;
		if (req.user.isAdmin !== undefined) userToSend.isAdmin = req.user.isAdmin;

		if (Object.keys(userToSend).length > 0) {
			res.status(200).json({ user: userToSend });
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (err) {
		console.error(err);
		res.json({ err, created: false });
	}
});

module.exports = {router};