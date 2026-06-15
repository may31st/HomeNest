const express = require("express");
const route = express.Router();
const {
  paymentByVnPay,
  paymentReturn,
  createDeposit,
  getDeposits,
  approveDeposit,
  rejectDeposit
} = require("../controllers/paymentController");

route.post("/create-payment", paymentByVnPay);
route.get("/vnpay-return", paymentReturn);

// Deposit APIs
route.post("/create-deposit", createDeposit);
route.get("/deposits", getDeposits);
route.put("/deposits/:id/approve", approveDeposit);
route.put("/deposits/:id/reject", rejectDeposit);

module.exports = route;