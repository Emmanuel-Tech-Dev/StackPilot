const PaymentManager = require("../../shared/helpers/paymentManager");

class TaransactionController {
  async initPayment(req, res) {
    const payment = PaymentManager.logEvent("PAYMENT_INITIATED_FAILED");
    const result = await payment.initPayment(req);
    res.status(result?.statusCode).json(result);
  }

  async onPaymentSuccess(paymentData) {
    console.log("Verified payment data:", {
      reference: paymentData.reference,
      amount: paymentData.amount, // Convert from kobo/pesewas
      email: paymentData.customer.email,
      status: paymentData.status,
      paid_at: paymentData.paid_at,
    });
  }

  async verifyPayment(req, res) {
    console.log("Received webhook:", this.onPaymentSuccess);
    return;
    const payment = PaymentManager.logEvent("PAYMENT_VERIFICATION_FAILED");

    const result = await payment.handleWebhook(
      req,
      res
      //   this.onPaymentSuccess
    );
    res.status(result?.statusCode).json(result);
  }
}

module.exports = new TaransactionController();
