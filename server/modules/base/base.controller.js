const { default: OTP } = require("otp");
const db = require("../../shared/dbConfig/config.js");
const Utilities = require("../../shared/helpers/functions.js");
const OTPService = require("../../shared/helpers/otpService.js");
const {
  handleErrorResponse,
} = require("../../shared/middleWare/errorHandler.js");
// const { Task, User } = require("../model/customModels/index.js");
// const modelConfig = require("../model/customModels/modelConfig.js");
const CrudOperation = require("./base.services.js");
const uploadService = require("../../shared/uploadService.js");

const genericController = {
  getAll: async (req, res) => {
    try {
      const queryString = req.query;
      // const Goals = db.models.goals;
      const model = req.model;
      const association = {
        // user: {
        //   model: User,
        //   attributes: ["name"],
        // },
      };
      // /
      // const associations = await Utilities.getDynamicAssociation(model);

      // const otp = new OTPService();
      // const secret = otp.generateOtpSecret();
      // const code =  otp.generateQrCode(secret);

      // console.log("otp secret :", secret);
      // console.log("otp code :", code);
      // console.log("otp isValid :" ,)

      const config = {
        queryString,
        tableModel: model,
        association /*associations*/,
      };

      // console.log(model);
      const operation = new CrudOperation(undefined, config);
      const results = await operation.readService();
      return res.status(results?.statusCode).json(results);
    } catch (error) {
      console.log(error);
      return handleErrorResponse(res, 500, "internal server error", "error");
    }
  },

  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const model = req.model;

      const config = { id, tableModel: model };
      const data = new CrudOperation(undefined, config);
      const results = await data.readAService();
      return res.status(200).json({ ...results });
    } catch (error) {
      console.log(error);
      return handleErrorResponse(res, 500, "internal server error", "error");
    }
  },

  getAllByUser: async (req, res) => {
    try {
      const user = req.user;
      const model = req.model;
      const { id } = user;
      const User = db.models.users;

      const config = { authID: id, tableModel: model, userTableModel: User };

      const operation = new CrudOperation(undefined, config);
      const results = await operation.readAuthUserService();
      return res.status(results?.success ? 200 : 404).json(results);
    } catch (error) {
      console.log(error);
      return handleErrorResponse(res, 500, "internal server error", "error");
    }
  },

  create: async (req, res) => {
    try {
      const model = req.model;
      const body = req.body;
      const User = db.models.admin;
      const modelConfig = await Utilities.getDynamicAssociation(model);
      // Get model-specific configuration
      const config = {
        config: {
          mainModel: model,
          userModel: User,
          associationConfig: modelConfig[model.name]?.associationConfig,
          customFields:
            modelConfig[model.name]?.associationConfig?.customIdField,
        },
      };

      const data = new CrudOperation(body, config);
      const result = await data.createService();

      //   console.log(result);

      if (result.status === "error") {
        return handleErrorResponse(
          res,
          result.statusCode,
          result.message,
          result.status
        );
      }

      return res.status(201).json({ ...result });
    } catch (error) {
      console.error("Create Error:", error);
      return handleErrorResponse(res, 500, "internal server error", error);
    }
  },

  updateOne: async (req, res) => {
    try {
      const data = req.body;
      const model = req.model;
      const id = req.params.id;
      const User = db.models.users;
      if (!data)
        return handleErrorResponse(
          res,
          404,
          "missing required fields",
          "error"
        );

      const dataRes = new CrudOperation(data, id, model, User);
      const updateDate = await dataRes.updateService();
      if (updateDate.status === "error")
        return handleErrorResponse(
          res,
          updateDate.statusCode,
          updateDate.message,
          "error"
        );

      return res.status(200).json({ ...updateDate });
    } catch (error) {
      console.log(error);
      return handleErrorResponse(res, 500, "internal server error", "error");
    }
  },

  deleteOne: async (req, res) => {
    try {
      const id = req.params.id;
      // const user = req.user;
      // const authID = user?.id;
      const model = req.model;
      const config = {
        id: id,
        tableModel: model,
      };
      const data = new CrudOperation(undefined, config);
      const results = await data.deleteService();
      console.log(results);
      return res.status(results?.statusCode).json({ ...results });
    } catch (error) {
      console.log(error);
      return handleErrorResponse(res, 500, "internal server error", "error");
    }
  },

  async uploadSingle(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const result = await uploadService.uploadSingleFile(file);

      res.json({
        success: true,
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Upload failed",
      });
    }
  },
};

module.exports = genericController;
