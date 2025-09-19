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
    // console.log(req);
    // return;
    const queryString = req.query;
    // if (!Utilities.hasAccess(req)) {
    //   res.status(403).json({ message: "Access denied" });
    //   return;
    // }

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

    const config = {
      queryString,
      tableModel: model,
      association /*associations*/,
    };

    // console.log(model);
    const operation = new CrudOperation(null, config);
    const results = await operation.readService(req);

    res.status(results?.statusCode).json(results);
  },

  getOne: async (req, res) => {
    const { id } = req.params;
    const model = req.model;

    const config = { id, tableModel: model };
    const data = new CrudOperation(null, config);
    const results = await data.readAService(req);
    res.status(results?.statusCode).json({ ...results });
  },

  getAllByUser: async (req, res) => {
    const user = req.user;
    const model = req.model;
    const { id } = user;
    const User = db.models.users;

    const config = { authID: id, tableModel: model, userTableModel: User };

    const operation = new CrudOperation(null, config);
    const results = await operation.readAuthUserService(req);
    res.status(results?.success ? 200 : 404).json(results);
  },

  create: async (req, res) => {
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
        customFields: modelConfig[model.name]?.associationConfig?.customIdField,
      },
    };

    const data = new CrudOperation(body, config);
    const result = await data.createService();

    //   console.log(result);
    res.status(result?.statusCode).json({ ...result });
  },

  updateOne: async (req, res) => {
    const data = req.body;
    const model = req.model;
    const id = req.params.id;
    const User = db.models.admin;
    const config = {
      id: id,
      tableModel: model,
      userTableModel: User,
    };

    if (!data)
      return handleErrorResponse(res, 404, "missing required fields", "error");

    const dataRes = new CrudOperation(data, config);
    const updateDate = await dataRes.updateService(req);
    if (updateDate.status === "error")
      return handleErrorResponse(
        res,
        updateDate.statusCode,
        updateDate.message,
        "error"
      );

    res.status(200).json({ ...updateDate });
  },

  deleteOne: async (req, res) => {
    const id = req.params.id;
    // const user = req.user;
    // const authID = user?.id;
    const model = req.model;
    const config = {
      id: id,
      tableModel: model,
    };
    const data = new CrudOperation(null, config);
    const results = await data.deleteService();
    console.log(results);
    res.status(results?.statusCode).json({ ...results });
  },

  // async uploadSingle(req, res) {
  //   try {
  //     const file = req.file;
  //     const body = req.body;
  //     const convertBody = JSON.parse(body.body);

  //     console.log(convertBody);
  //     // return;

  //     if (!file) {
  //       return res.status(400).json({
  //         success: false,
  //         error: "No file uploaded",
  //       });
  //     }

  //     const User = db.models.admin;
  //     const Goals = db.models.goals;
  //     // const modelConfig = await Utilities.getDynamicAssociation(model);
  //     // Get model-specific configuration
  //     // const config = {
  //     //   config: {
  //     //     mainModel: model,
  //     //     userModel: User,
  //     //     associationConfig: modelConfig[model.name]?.associationConfig,
  //     //     customFields:
  //     //       modelConfig[model.name]?.associationConfig?.customIdField,
  //     //   },
  //     // };
  //     const results = await uploadService.uploadSingleFile(file, "New Project");

  //     const dataWithFile = {
  //       ...convertBody,
  //       file_path: results.url,
  //       file_type: results.resource_type,
  //     };

  //     // const data = new CrudOperation(dataWithFile, config);
  //     // const result = await data.createService();

  //     // console.log(dataWithFile);
  //     // return;
  //     const result = await Goals.create(dataWithFile);

  //     //   console.log(result);

  //     if (result.status === "error") {
  //       return handleErrorResponse(
  //         res,
  //         result.statusCode,
  //         result.message,
  //         result.status
  //       );
  //     }

  //     res.json({
  //       success: true,
  //       message: "File and data uploaded successfully",
  //       // data: result,
  //     });
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     res.status(500).json({
  //       success: false,
  //       error: error.message || "Upload failed",
  //     });
  //   }
  // },

  filterOptions: async (req, res) => {
    const { dataIndex } = req.body;
    const config = {
      tableModel: req.model,
      dataIndex,
    };
    const operation = new CrudOperation(null, config);
    const results = await operation.filterServices(req);
    res.status(results?.statusCode).json(results);
  },

  bootstrap: async (req, res) => {
    const operation = new CrudOperation(null, null);
    const results = await operation.bootstrap(req);
    res.json(results);
  },

  getExtraMetaOptions: async (req, res) => {
    const operation = new CrudOperation(null, null);
    const results = await operation.getExtraMetaOptions(req);
    res.json({
      status: "Ok",
      msg: "Operation successful",
      details: results,
    });
  },

  getBrowserRoutes: async (req, res) => {
    const operation = new CrudOperation(null, null);
    const results = await operation.getBrowserRoutes(req);
    res.json({
      status: "Ok",
      msg: "Operation successful",
      details: results,
    });
  },

  getSubRoutes: async (req, res) => {
    const operation = new CrudOperation(null, null);
    const results = await operation.getSubResources(req);
    res.json({
      status: "Ok",
      msg: "Operation successful",
      details: results,
    });
  },

  addData: async (req, res) => {
    try {
      console.log(req.body);
      const { record, tablemodel } = req.body;
      const { tbl } = tablemodel;
      const model = db.models[tbl];
      console.log(record, tablemodel, model);

      res.status(200).json({
        status: "Ok",
        msg: "Operation successful",
        // details: response,
      });
    } catch (error) {
      res.status(500).json({ status: "Error", msg: error.message });
    }
  },

  deleteData: async (req, res) => {
    try {
      console.log(req.body);
      const { data, tablemodel } = req.body;
      const { tableName } = tablemodel;
      const model = db.models[tableName];
      console.log(model);
      await model.destroy({
        where: { id: data?.id },
      });
      res.status(200).json({
        status: "Ok",
        msg: "Operation successful",
        // details: response,
      });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        msg: error.message,
      });
    }
  },
};

module.exports = genericController;
