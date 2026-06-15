const express = require("express");
const route = express.Router();
const {
  getContracts,
  getContractById,
  signContract
} = require("../controllers/contractController");

route.get("/", getContracts);
route.get("/:id", getContractById);
route.put("/:id/sign", signContract);

module.exports = route;
