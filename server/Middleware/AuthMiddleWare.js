const jwt = require("jsonwebtoken");
const db = require("../models/models");
const e = require("express");

module.exports.checkUser = async (req, res, next) => {
	try {
		const token = req.cookies && req.cookies.jwt;

		if (!token) {
			throw new Error("JWT token not found in cookies");
		}

		const decodedToken = jwt.verify(token, process.env.SECRET);
		const user = await db.User.findByPk(decodedToken.id);

		if (!user) {
			throw new Error("User not found in database");
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("Error in checkUser middleware:", error);
		res.status(401).json({ error: "Unauthorized" });
	}
};

//CheckUserOptional (allow to check user, but don't need to be logged in.)
module.exports.checkUserOptional = async (req, res, next) => {
	try {
		const token = req.cookies && req.cookies.jwt;
		if (token)
		{
			const decodedToken = jwt.verify(token, process.env.SECRET);
			const user = await db.User.findByPk(decodedToken.id);
			req.user = user;
		}
		else {
			req.user = null;
		}
		next();
	} catch (error) {
		console.error("Error in checkUser middleware:", error);
		res.status(401).json({ error: "Unauthorized" });
	}
};




