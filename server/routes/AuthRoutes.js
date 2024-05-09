const { register, login, account, update_user, getUserEvents, getUserFinancials, getUsers,
	giveUserAdmin, giveUserUser, removeUser, resetUserPassword, getEvents, deleteUserPost,
	deleteEvent, unlistEvent, deleteFinancial, updatePassword
} = require("../Controllers/AuthControllers")
const {checkUser} = require("../Middleware/AuthMiddleWare");
const router = require("express").Router();

router.post("/register", register)
router.post("/login", login)

//user
router.get("/account",checkUser, account);
router.post("/account/update_user", checkUser, update_user)
router.post("/account/update_password", checkUser, updatePassword)
router.get("/account/user-gigs", checkUser, getUserEvents)
router.get("/account/user-financials", checkUser, getUserFinancials)
router.put("/account/unlist-event/:eventId", checkUser, unlistEvent)
router.delete("/account/delete-financial/:finId", checkUser, deleteFinancial)
router.delete("/account/delete-event/:eventId", checkUser, deleteEvent)


//admin
router.get("/account/admin/all-users", checkUser, getUsers)
router.get("/account/admin/all-events", checkUser, getEvents)
router.put("/account/admin/promote-user/:userId", checkUser, giveUserAdmin)
router.put("/account/admin/demote-user/:userId", checkUser, giveUserUser)
router.delete("/account/admin/remove-user/:userId", checkUser, removeUser)
router.delete("/account/admin/remove-user-post/:eventId", checkUser, deleteUserPost)
router.post("/account/admin/reset-user-password", checkUser, resetUserPassword)

module.exports = {router};