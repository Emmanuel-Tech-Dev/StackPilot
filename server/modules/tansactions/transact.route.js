const express = require("express");
const router = express.Router();

const PaymentManager = require("../../shared/helpers/paymentManager");
const transactionController = require("./tansact.controller");
const { asyncHandler } = require("../../shared/middleWare/errorHandler");

// const payment = new PaymentManager();

async function onPaymentSuccess(paymentData) {
  console.log("Verified payment data:", {
    reference: paymentData.reference,
    amount: paymentData.amount / 100, // Convert from kobo/pesewas
    email: paymentData.customer.email,
    status: paymentData.status,
    channle: paymentData.channel,
    paid_at: paymentData.paid_at,
  });
}

async function onRefundSuccess(paymentData) {
  console.log("Verified refund data:", {
    ...paymentData,
    // reference: paymentData.reference,
    // amount: paymentData.amount / 100, // Convert from kobo/pesewas
    // email: paymentData.customer.email,
    // status: paymentData.status,
    // channle: paymentData.channel,
    // paid_at: paymentData.paid_at,
  });
}

router.post("/init_payment", asyncHandler(transactionController.initPayment));
router.post("/init_refund", asyncHandler(transactionController.initRefund));
router.post("/webhook/paystack", async (req, res) => {
  const payment = PaymentManager.logEvent("PAYMENT_VERIFICATION_FAILED");
  payment.handleWebhook(req, res, onPaymentSuccess, onRefundSuccess);
});

module.exports = router;
