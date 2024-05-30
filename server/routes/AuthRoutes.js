const { register, login, account, giveUserAdmin, giveUserUser, removeUser, resetUserPassword, updatePassword } = require("../Controllers/AuthControllers")
const {checkUser} = require("../Middleware/AuthMiddleWare");
const router = require("express").Router();

router.post("/register", register)
router.post("/login", login)

//user
router.get("/account",checkUser, account);
router.post("/account/update_password", checkUser, updatePassword)

//admin
router.put("/account/admin/promote-user/:userId", checkUser, giveUserAdmin)
router.put("/account/admin/demote-user/:userId", checkUser, giveUserUser)
router.delete("/account/admin/remove-user/:userId", checkUser, removeUser)
router.post("/account/admin/reset-user-password", checkUser, resetUserPassword)

module.exports = {router};