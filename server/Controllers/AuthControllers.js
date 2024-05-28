const { userSchema } = require("../helpers/validators");
const db = require("../models/models");
const jwt = require("jsonwebtoken");
const {updateUserToAdmin, getAllUsers, demoteUserFromAdmin, removeUser, resetUserPassword,
	 deletePost} = require("../routes/AdminService");


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


module.exports.update_user = async (req, res, next) => {
	try {
		console.log("do we get to update_user?")
		const data = req.body;
		const userId = req.user.user_id;
		console.log(data.instruments)
		//Validate
		data.instruments = await instrumentArrayToIds(data?.instruments);
		delete data.password;
		const {error} = userSchema.fork(['email', 'password'], (schema) => schema.optional()).validate(data)
		if (error) {
			console.error(error);
			return res.status(403).send(error.details);
			;
		}

		await db.User.updateUser(userId, data);

		//Instruments
		newInstrumentArray = [];

		if (data.instruments) {
			await db.UserInstrument.destroy({ where: { user_id: userId } });
			for (const instrumentId of data.instruments) {
				try {
					newInstrument = await db.UserInstrument.findOrCreate({
						where: {
							instrument_id: instrumentId,
							user_id: userId
						}
					});
					newInstrumentArray.push(newInstrument);
				} catch (err) {
					console.error(`Error adding instrument with ID ${instrumentId}:`, err);
				}
			}
		}

		res.status(200).json({success: true});
	} catch (err) {
		console.error(err);
		res.status(500).json({error: "Internal server error"});
	}
};

module.exports.getUserFinancials = async (req,res, next) => {
	try {
		const userId = req.user.user_id;
		const finIds = await  db.FinStatus.getFinIdsByUserId(userId);
		const financials = await db.Financial.getFinancialsByFinIds(finIds);
		const cleanedFinancials = financials.map(financial => financial.dataValues);

		res.status(200).json({ userFinancials: cleanedFinancials });
	}catch (error){
		console.error('Error fetching user financials:', error);
		throw new Error('Failed to fetch user financails');
	}
}

//Admin func to get all users
module.exports.getUsers = async (req,res,next) => {
	try{
		if (req.user.isAdmin) {
			const users = await getAllUsers();
			res.status(200).json({users : users});
		} else {
			res.status(403).json({ error: "Access denied. You are not authorized to perform this action." });
		}
	}catch (error){
		console.error('Error fetching Users:', error);
		throw new Error('Failed to fetch users');
	}
}


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


//admin to delete user posts
module.exports.deleteUserPost = async  (req,res,next) => {
	try {
		if (!req.user.isAdmin) {
			return res.status(403).json({ error: "Access denied. Only admins can reset passwords." });
		}
		const eventId = req.params.eventId;
		const result = await deletePost(eventId);

		const eventExists = await db.Event.findOne({where: {event_id: eventId}});
		if (!eventExists) {
			res.status(200).json({ success: true, message: "User has been successfully removed from the database" });
		} else {
			res.status(500).json({ error: 'Failed to remove user from the database' });
		}

	}catch (error){
		console.error("Error deleting a users post:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}


//user to delete their own events
module.exports.deleteEvent = async (req, res, next) => {
	try {
		const eventId = req.params.eventId;
		const userId = req.user.user_id;

		// Make sure it is their event to delete
		const userStatus = await db.UserStatus.findOne({
			where: {
				user_id: userId,
				event_id: eventId
			}
		});

		if (!userStatus || userStatus.status !== 'owner') {
			return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this event' });
		}

		const result = await db.Event.deleteByEventId(eventId);

		if (result) {
			res.status(200).json({ success: true, message: "Event deleted successfully" });
		} else {
			res.status(404).json({ error: 'Event not found' });
		}
	} catch (error) {
		console.error("Error deleting event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

//owner can also unlist their own events
module.exports.unlistEvent = async (req, res, next) => {
	try {
		const eventId = req.params.eventId;
		const userId = req.user.user_id;

		const userStatus = await db.UserStatus.findOne({
			where: {
				user_id: userId,
				event_id: eventId
			}
		});

		if (!userStatus || userStatus.status !== 'owner') {
			return res.status(403).json({ error: 'Forbidden: You are not authorized to unlist this event' });
		}

		const result = await db.Event.unlistByEventId(eventId);

		if (result) {
			res.status(200).json({ success: true, message: "Event unlisted successfully" });
		} else {
			res.status(404).json({ error: 'Event not found' });
		}
	} catch (error) {
		console.error("Error unlisting event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports.deleteFinancial = async (req, res, next) => {
	try {
		const finId = req.params.finId;
		const userId = req.user.user_id;

		const finStatus = await db.FinStatus.findOne({
			where: {
				user_id: userId,
				fin_id: finId
			}
		});

		if (!finStatus) {
			return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this financial object' });
		}

		const result = await db.Financial.deleteFinancialByFinId(finId);

		if (result) {
			res.status(200).json({ success: true, message: "Financial object deleted successfully" });
		} else {
			res.status(404).json({ error: 'Financial object not found' });
		}
	} catch (error) {
		console.error("Error deleting financial object:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};








