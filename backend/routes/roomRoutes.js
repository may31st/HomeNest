const express = require("express"); 
const route = express.Router();
const { getListRoomController, getDetailRoomById, updateRoomStatusController } = require("../controllers/roomController");

route.get("/", getListRoomController);
route.get("/:id", getDetailRoomById);
route.put("/:id/status", updateRoomStatusController);

module.exports = route;