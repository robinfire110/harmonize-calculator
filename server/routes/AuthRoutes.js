const {checkUser} = require("../Middleware/AuthMiddleWare");
const router = require("express").Router();

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
			res.status(200).json({ user: userData.user_id });
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (err) {
		console.error(err);
		const errors = handleErrors(err);
		res.json({errors, created: false});
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
		const errors = handleErrors(err);
		res.json({ errors, created: false });
	}
});

module.exports = {router};