const express = require("express");
const route = express.Router();
const {
  paymentByVnPay,
  paymentReturn,
  createDeposit,
  confirmMockPayment,
  getDeposits,
  approveDeposit,
  rejectDeposit,
  cancelDeposit,
  deleteDeposit
} = require("../controllers/paymentController");

route.post("/create-payment", paymentByVnPay);
route.get("/vnpay-return", paymentReturn);

// Deposit APIs
route.post("/create-deposit", createDeposit);
route.post("/confirm-mock-payment", confirmMockPayment);
route.get("/deposits", getDeposits);
route.put("/deposits/:id/approve", approveDeposit);
route.put("/deposits/:id/reject", rejectDeposit);
route.put("/deposits/:id/cancel", cancelDeposit);
route.delete("/deposits/:id", deleteDeposit);

module.exports = route;