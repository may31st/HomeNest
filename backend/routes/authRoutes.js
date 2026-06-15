const express = require("express"); 
const route = express.Router();
const { createNewUser, checkingLogin, updateProfile, getAllUsersController, deleteUserController } = require("../controllers/authController"); 

route.post("/register", createNewUser);
route.post("/login", checkingLogin);
route.put("/update-profile", updateProfile);
route.get("/all-users", getAllUsersController);
route.delete("/delete-user/:id", deleteUserController);

module.exports = route;