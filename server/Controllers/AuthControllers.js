const { userSchema } = require("../helpers/validators");
const db = require("../models/models");
const jwt = require("jsonwebtoken");
const {updateUserToAdmin, demoteUserFromAdmin, removeUser, resetUserPassword} = require("../routes/AdminService");


const maxAge = 3*24*60*60;

const createToken = (id) => {
	return jwt.sign({ id }, process.env.SECRET, {
		expiresIn: maxAge,
	});
}

const handleErrors = (err) => {
	let errors = { email:"", pass:""};
	if(err.message)


	if(err.message === "Incorrect Email"){
		errors.email = "That email is not registered";
	}

	if(err.message === "Incorrect Password"){
		errors.email = "Incorrect Password";
	}

	if(err.code === 11000){
		errors.email = "Email is already registered";
		return errors;
	}
	if(err.message.includes("Users validation failed")){
		Object.values(err.error).forEach(({properties}) => {
			errors[properties.path] = properties.message;
		})
	}
	return errors;
}

module.exports.register = async (req, res, next) => {
	try {
		const data = req.body;
        const {error} = userSchema.validate(data)
        if (error) 
        {
            console.error(error);
            return res.status(403).send(error.details);;
        }

		//Create
		const newUser = await db.User.create({email: data?.email, password: data?.password, name: data?.name, zip: data?.zip, is_admin: data?.is_admin});

		// Generate JWT token for the new user
		const token = createToken(newUser.user_id);

		// Set the JWT token in the cookie
		res.cookie("jwt", token, {
			withCredentials: true,
			httpOnly: false,
			maxAge: maxAge * 1000,
		});

		// Respond with the user ID and a success message
		res.status(201).json({user: newUser.user_id, created: true});
	} catch (err) {
		console.error(err);
		const errors = handleErrors(err);
		res.json({errors, created: false});
	}
};

module.exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await db.User.login(email,password);
		if (user) {
			const token = createToken(user.user_id);
			res.cookie("jwt", token, {
				withCredentials: true,
				httpOnly: false,
				maxAge: maxAge * 1000,
			});
			res.status(200).json({ user: user.user_id, created: false });
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (err) {
		console.error(err);
		const errors = handleErrors(err);
		res.json({errors, created: false});
	}
};

module.exports.updatePassword = async (req, res, next) => {
	const userId = req.user.user_id;
	const { oldPassword, newPassword } = req.body;

	try {
		const result = await db.User.resetUserPassword(userId, oldPassword, newPassword);

		if (result.success) {
			res.json({ success: true, message: "Password updated successfully" });
		} else {
			res.status(400).json({ success: false, message: "Failed to update password" });
		}
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ success: false, error: error.message });
	}
};


module.exports.account = async (req, res, next) => {
	try {
		const userToSend = {};

		if (req.user.user_id) userToSend.user_id = req.user.user_id;
		if (req.user.email) userToSend.email = req.user.email;
		if (req.user.name) userToSend.name = req.user.name;
		if (req.user.zip) userToSend.zip = req.user.zip;
		if (req.user.isAdmin !== undefined) userToSend.isAdmin = req.user.isAdmin;
		if (req.user.Events) userToSend.Events = req.user.Events;

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
};

module.exports.giveUserAdmin = async (req, res, next) => {
	try {
		const userIdToUpdate = req.params.userId;

		await updateUserToAdmin(userIdToUpdate);

		const updatedUser = await db.User.findByPk(userIdToUpdate);
		if (updatedUser && updatedUser.isAdmin) {
			res.status(200).json({ success: true, message: "User now has admin privileges" });
		} else {
			res.status(500).json({ error: 'Failed to update User' });
		}
	} catch (error) {
		console.error('Error Giving user admin privileges:', error);
		res.status(500).json({ error: 'Failed to update User' });
	}
}

module.exports.giveUserUser = async (req, res, next) => {
	try {
		const userIdToUpdate = req.params.userId;

		await demoteUserFromAdmin(userIdToUpdate);

		const updatedUser = await db.User.findByPk(userIdToUpdate);
		if (updatedUser && !updatedUser.isAdmin) {
			res.status(200).json({ success: true, message: "Admin User has been demoted to User" });
		} else {
			res.status(500).json({ error: 'Failed to update User' });
		}
	} catch (error) {
		console.error('Error Demoting user:', error);
		res.status(500).json({ error: 'Failed to update User' });
	}
}


module.exports.removeUser = async (req, res, next) => {
	try {
		const userIdToRemove = req.params.userId;
		await removeUser(userIdToRemove);

		const userExists = await db.User.findByPk(userIdToRemove);
		if (!userExists) {
			res.status(200).json({ success: true, message: "User has been successfully removed from the database" });
		} else {
			res.status(500).json({ error: 'Failed to remove user from the database' });
		}
	} catch (error) {
		console.error('Error removing user:', error);
		res.status(500).json({ error: 'Failed to remove user from the database' });
	}
}

//admin to reset password
module.exports.resetUserPassword = async (req, res, next) => {
	try {
		if (!req.user.isAdmin) {
			return res.status(403).json({ error: "Access denied. Only admins can reset passwords." });
		}
		const userId = req.body.user.user_id;
		const newPassword = req.body.newPassword;
		const result = await resetUserPassword(userId, newPassword);

		res.status(200).json({ success: true, message: "Successfully reset user password" });
	} catch (error) {
		console.error("Error resetting user password:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};







