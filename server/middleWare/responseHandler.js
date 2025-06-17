class ResponseHandler {
  constructor(config = {}) {
    this._statusCode = config?.statusCode;
    this._message = config?.message;
    this._status = config?.status;
    this._data = config?.data;
    this._serverError = config?.serverError;
    this._metadata = config?.metadata;
  }

  //   SETTERS

  set statusCode(code) {
    if (typeof code !== "number" || code < 100 || code > 599) {
      throw new Error("Invalid HTTP status code");
    }
    this._statusCode = code;
  }

  set errorMessage(message) {
    this._serverError = typeof message === "string" ? message : null;
    this._message = null;
    this._data = null;
    this._status = "error";
    if (this._statusCode < 400) {
      this._statusCode = 400;
    }
  }

  set metadata(metadata) {
    this._metadata = metadata;
  }

  //   set successMessage(message){
  //     this._serverError = null;
  //     this._message = typeof message === "string" ? message : null;
  //     this._data = null;
  //     this._status = "ok";
  //   }

  set data(payload) {
    this._serverError = null;
    this._message = null;
    this._data = payload;
    this._status = "ok";
  }

  //   GETTERS

  get successResponse() {
    const response = {
      message: this._message,
      status: this._status,
      data: this._data,
      statusCode: this._statusCode,
    };

    if (this._metadata) response.metadata = this._metadata;
    return response;
  }

  get errorResponse() {
    const response = {
      message: this._message,
      status: this._status,
      errorMessage: this._serverError,
      statusCode: this._statusCode,
    };
    return response;
  }
}

module.exports = ResponseHandler;
