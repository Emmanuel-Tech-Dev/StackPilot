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
  };

  constructor(config = {}, event) {
    this.config = this._validateAndSetConfig(config);
    this.processedRefs = new Set();
    this.event = event;
    // Bind methods to preserve context
    // this._bindMethods();
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

  _bindMethods() {
    this.createVirtualAccount = this.createVirtualAccount.bind(this);
    this.initPayment = this.initPayment.bind(this);
    this.verifyPayment = this.verifyPayment.bind(this);
    this.handleWebhook = this.handleWebhook.bind(this);
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

      // console.log(payload);
      // return;
      const response = await this._makeApiRequest(
        "POST",
        "/transaction/initialize",
        payload
      );

      return this._formatPaymentResponse(response, req);
    } catch (error) {
      // console.log(this._handlePaymentError(error, "initializing", req));
      throw this._handlePaymentError(error, "initializing", req);
    }
  }

  _buildPaymentPayload(data, reference) {
    // console.log("initiating payment payload ", data);

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
      "RetryError",
      { attempts: maxRetries, lastError: lastError.message }
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

  async handleWebhook(req, res, onPaymentSuccess) {
    try {
      // console.log("Received webhook:", req.body, onPaymentSuccess);
      // return;
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

      await this._processWebhookEvent(event, onPaymentSuccess);

      res.status(200).json({ status: "success", message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async _processWebhookEvent(event, onPaymentSuccess) {
    if (event.event !== PaymentManager.WEBHOOK_EVENTS.CHARGE_SUCCESS) {
      console.log(`Ignoring webhook event: ${event.event}`);
      return;
    }

    const reference = event.data?.reference;
    if (!reference) {
      throw new Error("No reference found in webhook data");
    }

    // Prevent duplicate processing
    if (this.processedRefs.has(reference)) {
      console.log(`Duplicate webhook ignored for reference: ${reference}`);
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
      // if (data?.amount) {
      //   config.data.amount = data?.amount * 100;
      // }

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
  }
}

module.exports = PaymentManager;
