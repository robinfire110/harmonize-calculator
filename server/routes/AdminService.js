const db = require("../models/models");
const bcrypt = require("bcrypt");

async function createUserWithAdminPrivileges(userData) {
	try {
		return await db.User.create(userData);
	} catch (error) {
		console.error("Error creating user with admin privileges:", error);
		throw error;
	}
}

async function updateUserToAdmin(userId) {
	try {
		const user = await db.User.findByPk(userId);
		if (user) {
			user.isAdmin = true;
			await user.save();
		} else {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error updating user to admin:", error);
		throw error;
	}
}
async function demoteUserFromAdmin(userId) {
	try {
		const user = await db.User.findByPk(userId);
		if (user) {
			user.isAdmin = false;
			await user.save();
		} else {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error demoting user:", error);
		throw error;
	}
}

async function removeUser(userId) {
	try {
		const user = await db.User.findByPk(userId, {include: [db.Event, db.Financial]});
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

			//Destroy user
            await user.destroy();
        } else {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error removing user:", error);
		throw error;
	}
}

async function getAllUsers() {
	try {
		return await db.User.findAll();
	} catch (error) {
		console.error("Error fetching all users:", error);
		throw error;
	}
}

async function resetUserPassword(userId, newPassword) {
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 10); //higher salt means
		// longer computational time taken to brute force
		const user = await db.User.findByPk(userId);
		if(user){
			user.update({ password: hashedPassword });
			await user.save();
		}else{
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error resetting user password:", error);
		throw error;
	}
}

async function deletePost(event_id){
	try{
		const event = await db.Event.findOne({where: {event_id: event_id}});
		if (event) {
			await event.destroy();
		} else {
			throw new Error("User not found");
		}
	}catch (error){

	}
}


module.exports = {
	createUserWithAdminPrivileges,
	updateUserToAdmin,
	getAllUsers,
	demoteUserFromAdmin,
	removeUser,
	resetUserPassword,
	deletePost
};