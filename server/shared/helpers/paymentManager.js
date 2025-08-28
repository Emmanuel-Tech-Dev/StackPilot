const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const AppError = require("./appError");
const logger = require("../middleWare/logger");

class PaymentManager {
  // Configuration constants
  static PAYMENT_TYPES = {
    PAYSTACK: "paystack",
  };

  static CURRENCIES = {
    GHS: "GHS",
    NGN: "NGN",
    USD: "USD",
  };

  static WEBHOOK_EVENTS = {
    CHARGE_SUCCESS: "charge.success",
    TRANSFER_SUCCESS: "transfer.success",
    REFUND_PENDING: "refund.pending",
    REFUND_PROCESSED: "refund.processed",
    REFUND_FAILED: "refund.failed",
  };

  constructor(config = {}, event) {
    this.config = this._validateAndSetConfig(config);
    this.processedRefs = new Set();
    this.processedRefunds = new Set(); // Track processed refunds
    this.event = event;
  }

  static logEvent(event) {
    return new PaymentManager(event);
  }

  _validateAndSetConfig(config) {
    const {
      paymentType = PaymentManager.PAYMENT_TYPES.PAYSTACK,
      ApiPublicKey = process.env.PAYSTACK_PUBLIC_KEY,
      ApiSecret = process.env.PAYSTACK_SECRET_KEY,
      ApiUrl = "https://api.paystack.co",
      currency = PaymentManager.CURRENCIES.GHS,
      callbackUrl = process.env.PAYSTACK_CALLBACK_URL,
      cancelUrl = "",
      successUrl = "",
      baseUrl = "",
    } = config;

    // Validate required fields
    if (!ApiPublicKey || !ApiSecret) {
      throw new AppError(
        "API credentials are required (ApiPublicKey and ApiSecret)",
        400,
        "InternalError"
      );
    }

    return {
      paymentType,
      ApiPublicKey,
      ApiSecret,
      ApiUrl,
      currency,
      callbackUrl,
      cancelUrl,
      successUrl,
      baseUrl,
    };
  }

  generatePaymentReference(prefix = "GUEST") {
    const timestamp = this._getCurrentTimestamp();
    const randomSuffix = this._getRandomSuffix();
    return `${prefix}${timestamp}-${randomSuffix}`;
  }

  _getCurrentTimestamp() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
    ].join("");
  }

  _getRandomSuffix() {
    return uuidv4().split("-")[0].slice(-3);
  }

  _validatePaymentData(data) {
    const errors = [];

    if (!data.amount || data.amount <= 0) {
      errors.push("Valid amount is required");
    }

    if (!data.email || !this._isValidEmail(data.email)) {
      errors.push("Valid email is required");
    }

    if (errors.length > 0) {
      throw new AppError(
        `Payment validation failed: ${errors.join(", ")}`,
        400,
        "ValidationError",
        {
          user: {
            email: data?.email,
          },
        }
      );
    }
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async initPayment(req) {
    try {
      this._validatePaymentData(req.body);

      const referenceNumber = this.generatePaymentReference();
      const payload = this._buildPaymentPayload(req.body, referenceNumber);

      const response = await this._makeApiRequest(
        "POST",
        "/transaction/initialize",
        payload
      );

      return this._formatPaymentResponse(response, req);
    } catch (error) {
      throw this._handlePaymentError(error, "initializing payment", req);
    }
  }

  _buildPaymentPayload(data, reference) {
    return {
      amount: data.amount * 100,
      email: data.email || "emmanuelkusi345@gmail.com",
      reference,
      currency: this.config.currency,
      callback_url: this.config.callbackUrl,
      metadata: {
        customId: data.customId,
        ...data.metadata,
      },
    };
  }

  _formatPaymentResponse(response, req) {
    const markedAccessCode = response?.data?.access_code.replace(
      /.(?=.{4})/g,
      "*"
    );
    logger.access({
      timestamp: new Date().toISOString(),
      event: "PAYMENT_INITIATED",
      statusCode: 200,
      type: "Access",
      message: "Payment initiated",
      meta: {
        reference: response?.data?.reference,
        accessCode: markedAccessCode,
        request: {
          userAgent: req.headers["user-agent"],
          ip: req.ip,
          method: req.method,
          path: req.path,
        },
      },
    });

    return {
      status: "ok",
      success: true,
      statusCode: 200,
      reference: response.data.reference,
      authUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      data: response.data,
    };
  }

  async verifyPayment(data, maxRetries = 3, delay = 2000) {
    const { reference } = data;

    if (!reference) {
      throw new AppError(
        "Payment reference is required",
        400,
        "ValidationError"
      );
    }

    return await this._retryOperation(
      () => this._performPaymentVerification(reference),
      maxRetries,
      delay,
      `verifying payment ${reference}`
    );
  }

  async _performPaymentVerification(reference) {
    const response = await this._makeApiRequest(
      "GET",
      `/transaction/verify/${reference}`
    );

    const paymentData = response.data;

    if (!paymentData || paymentData.reference !== reference) {
      throw new Error("Invalid payment data or reference mismatch");
    }

    if (paymentData.status !== "success") {
      throw new Error(`Payment not successful. Status: ${paymentData.status}`);
    }

    return paymentData;
  }

  // NEW: Refund functionality
  async initRefund(req) {
    try {
      this._validateRefundData(req.body);

      const payload = this._buildRefundPayload(req.body);

      const response = await this._makeApiRequest("POST", "/refund", payload);

      return this._formatRefundResponse(response, req);
    } catch (error) {
      throw this._handlePaymentError(error, "initiating refund", req);
    }
  }

  _validateRefundData(data) {
    const errors = [];

    if (!data.transaction) {
      errors.push("Transaction ID or reference is required");
    }

    if (data.amount && data.amount <= 0) {
      errors.push("Refund amount must be greater than 0");
    }

    if (errors.length > 0) {
      throw new AppError(
        `Refund validation failed: ${errors.join(", ")}`,
        400,
        "ValidationError"
      );
    }
  }

  _buildRefundPayload(data) {
    const payload = {
      transaction: data.transaction,
    };

    if (data.amount) {
      payload.amount = data.amount * 100; // Convert to kobo/pesewas
    }

    if (data.customer_note) {
      payload.customer_note = data.customer_note;
    }

    if (data.merchant_note) {
      payload.merchant_note = data.merchant_note;
    }

    return payload;
  }

  _formatRefundResponse(response, req) {
    logger.access({
      timestamp: new Date().toISOString(),
      event: "REFUND_INITIATED",
      statusCode: 200,
      type: "Access",
      message: response.data.message,
      meta: {
        reference: response.data.transaction?.reference,
        refundId: response.data.id,
        amount: response.data.amount,
        status_code: response.data.status,
        request: {
          userAgent: req.headers["user-agent"],
          ip: req.ip,
          method: req.method,
          path: req.path,
        },
      },
    });

    return {
      status: "success",
      success: true,
      statusCode: 200,
      refundId: response.data.id,
      reference: response.data.transaction?.reference,
      amount: response.data.amount,
      status_code: response.data.status,
      message: response.data.message,
      data: response.data,
    };
  }

  async _retryOperation(operation, maxRetries, delay, operationName) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          console.warn(
            `${operationName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`
          );
          await this._delay(delay);
        }
      }
    }

    throw new AppError(
      `Error ${operationName} after ${maxRetries} attempts: ${lastError.message}`,
      500,
      "AppError",
      { attempts: maxRetries, lastError: lastError.message },
      { event: this.event }
    );
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  validateSignature(rawBody, signature) {
    if (!signature || !rawBody) {
      return false;
    }

    try {
      const hash = crypto
        .createHmac("sha512", this.config.ApiSecret)
        .update(rawBody, "utf8")
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(signature, "hex")
      );
    } catch (error) {
      console.error("Signature validation error:", error.message);
      return false;
    }
  }

  // ENHANCED: Updated handleWebhook to support refund events
  async handleWebhook(req, res, onPaymentSuccess, onRefundProcessed) {
    try {
      const signature = req.headers["x-paystack-signature"];
      const rawBody =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);

      if (!this.validateSignature(rawBody, signature)) {
        console.warn("Invalid webhook signature received");
        throw new AppError(
          "Invalid webhook signature received",
          401,
          "ValidationError",
          {
            details: {
              rawBody,
              signature,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const event =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      await this._processWebhookEvent(
        event,
        onPaymentSuccess,
        onRefundProcessed
      );

      res.status(200).json({ status: "success", message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ENHANCED: Updated to handle both payment and refund events
  async _processWebhookEvent(event, onPaymentSuccess, onRefundProcessed) {
    const eventType = event.event;

    // Handle payment success
    if (eventType === PaymentManager.WEBHOOK_EVENTS.CHARGE_SUCCESS) {
      await this._processPaymentWebhook(event, onPaymentSuccess);
      return;
    }

    // Handle refund events
    if (this._isRefundEvent(eventType)) {
      await this._processRefundWebhook(event, onRefundProcessed);
      return;
    }

    console.log(`Ignoring webhook event: ${eventType}`);
  }

  _isRefundEvent(eventType) {
    return [
      PaymentManager.WEBHOOK_EVENTS.REFUND_PENDING,
      PaymentManager.WEBHOOK_EVENTS.REFUND_PROCESSED,
      PaymentManager.WEBHOOK_EVENTS.REFUND_FAILED,
    ].includes(eventType);
  }

  async _processPaymentWebhook(event, onPaymentSuccess) {
    const reference = event.data?.reference;
    if (!reference) {
      throw new Error("No reference found in payment webhook data");
    }

    // Prevent duplicate processing
    if (this.processedRefs.has(reference)) {
      console.log(
        `Duplicate payment webhook ignored for reference: ${reference}`
      );
      return;
    }

    this.processedRefs.add(reference);

    try {
      const verifiedData = await this.verifyPayment({ reference });
      await onPaymentSuccess(verifiedData);
      console.log(`Payment successfully processed: ${reference}`);
    } catch (error) {
      console.error(
        `Payment verification failed for ${reference}:`,
        error.message
      );
      // Remove from processed refs to allow retry
      this.processedRefs.delete(reference);
      throw error;
    }
  }

  // NEW: Process refund webhook events
  async _processRefundWebhook(event, onRefundProcessed) {
    if (!onRefundProcessed) {
      console.log(
        "No refund handler provided, skipping refund webhook processing"
      );
      return;
    }

    const refundId = event.data?.id;
    const transactionReference = event.data?.transaction?.reference;

    if (!refundId) {
      throw new Error("No refund ID found in refund webhook data");
    }

    // Create a unique identifier for the refund event
    const refundEventId = `${refundId}-${event.event}`;

    // Prevent duplicate processing
    if (this.processedRefunds.has(refundEventId)) {
      console.log(`Duplicate refund webhook ignored for refund: ${refundId}`);
      return;
    }

    this.processedRefunds.add(refundEventId);

    try {
      // Log the refund event
      logger.access({
        timestamp: new Date().toISOString(),
        event: `REFUND_WEBHOOK_${event.event.toUpperCase()}`,
        statusCode: 200,
        type: "Webhook",
        message: `Refund webhook received: ${event.event}`,
        meta: {
          refundId,
          transactionReference,
          amount: event.data?.amount,
          status: event.data?.status,
          eventType: event.event,
        },
      });

      // Call the refund handler with the webhook data
      await onRefundProcessed({
        refundId,
        transactionReference,
        amount: event.data?.amount,
        status: event.data?.status,
        eventType: event.event,
        customerNote: event.data?.customer_note,
        merchantNote: event.data?.merchant_note,
        fullData: event.data,
      });

      console.log(
        `Refund successfully processed: ${refundId} (${event.event})`
      );
    } catch (error) {
      console.error(`Refund processing failed for ${refundId}:`, error.message);
      // Remove from processed refunds to allow retry
      this.processedRefunds.delete(refundEventId);
      throw error;
    }
  }

  async createVirtualAccount(data) {
    try {
      this._validateVirtualAccountData(data);

      const payload = this._buildVirtualAccountPayload(data);

      const response = await this._makeApiRequest(
        "POST",
        "/dedicated_account",
        payload
      );

      return this._formatVirtualAccountResponse(response);
    } catch (error) {
      throw this._handlePaymentError(error, "creating virtual account");
    }
  }

  _validateVirtualAccountData(data) {
    const errors = [];

    if (!data.email || !this._isValidEmail(data.email)) {
      errors.push("Valid email is required");
    }

    if (!data.firstName || !data.lastName) {
      errors.push("First name and last name are required");
    }

    if (errors.length > 0) {
      throw new AppError(
        `Virtual account validation failed: ${errors.join(", ")}`,
        400,
        "ValidationError"
      );
    }
  }

  _buildVirtualAccountPayload(data) {
    return {
      customer: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || "08101234567",
      },
      preferred_bank: data.preferredBank || "gtbank",
      currency: this.config.currency,
      country: this._getCurrencyCountry(),
      metadata: {
        program: "payment-manager",
        customId: data.customId,
        createdAt: new Date().toISOString(),
      },
    };
  }

  _getCurrencyCountry() {
    const currencyCountryMap = {
      [PaymentManager.CURRENCIES.GHS]: "GHA",
      [PaymentManager.CURRENCIES.NGN]: "NG",
      [PaymentManager.CURRENCIES.USD]: "US",
    };

    return currencyCountryMap[this.config.currency] || "GHA";
  }

  _formatVirtualAccountResponse(response) {
    return {
      status: "success",
      success: true,
      accountDetails: response.data,
      accountNumber: response.data.account_number,
      accountName: response.data.account_name,
      bankName: response.data.bank?.name,
      data: response.data,
    };
  }

  async _makeApiRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.config.ApiUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.config.ApiSecret}`,
          "Content-Type": "application/json",
        },
      };

      if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
        config.data = data;
      }

      const response = await axios(config);

      if (!response.data || response.data.status === false) {
        throw new Error(response.data?.message || "API request failed");
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            `API error: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw error;
    }
  }

  _handlePaymentError(error, operation, req) {
    if (error instanceof AppError) {
      return error;
    }

    throw new AppError(
      `Error ${operation} ${this.config.paymentType} payment: ${error.message}`,
      error.status || 500,
      "InternalError",
      {
        paymentType: this.config.paymentType,
        operation,
        originalError: error.message,
        request: req
          ? {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            }
          : null,
      },
      { event: this.event }
    );
  }

  getConfig() {
    return {
      paymentType: this.config.paymentType,
      currency: this.config.currency,
      ApiUrl: this.config.ApiUrl,
      hasApiSecret: !!this.config.ApiSecret,
      hasPublicKey: !!this.config.ApiPublicKey,
      callbackUrl: this.config.callbackUrl,
    };
  }

  clearProcessedRefs() {
    this.processedRefs.clear();
    this.processedRefunds.clear();
  }
}

module.exports = PaymentManager;
