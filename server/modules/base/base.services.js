const db = require("../../shared/dbConfig/config");
const QueryBuilder = require("../../shared/helpers/queryUtils");
// const ResponseHandler = require("../../shared/middleWare/responseHandler");
const utils = require("../../shared/helpers/functions");
const logger = require("../../shared/middleWare/logger");
class CrudOperation {
  static apisettings = "apisettings";

  constructor(data, config = {}) {
    this.queryString = config?.queryString;
    this.tableModel = config?.tableModel;
    this.association = config?.association || {};
    this.data = data || {};
    this.id = config?.id;
    this.authID = config?.authID;
    this.userTableModel = config?.userTableModel;
    this.modelconfig = config?.config;
    this.sequelize = db.sequelize || db;
    // this.apiSettingsCache = new Map();
    // this.apisettings = "apisettings";
  }

  async readService() {
    try {
      const SETTINGS_KEY = CrudOperation.apisettings;
      let getApiQueryConfig;

      if (SETTINGS_KEY) {
        getApiQueryConfig = await utils.cacheConfigSettings(SETTINGS_KEY);
      }

      const query = new QueryBuilder(
        this.queryString,
        this.association,
        getApiQueryConfig || {}
      );
      // query.configSettings = getApiQueryConfig;

      const options = query.build();

      const start = Date.now();

      const { count, rows } = await this.tableModel.findAndCountAll(options);
      const end = Date.now();
      const totalPages = Math.ceil(count / options.limit);
      if (this.queryString.page > totalPages && count > 0) {
        options.offset = (totalPages - 1) * options.limit;
      }
      const currentPage = Math.floor(options.offset / options.limit) + 1;

      // Format the response data
      // const formattedRows = rows.map((row) => row.get({ plain: true }));

      query._recordQueryStats(end - start);
      const response = {
        success: true,
        message: count === 0 ? "No data found" : "Data successfully fetched",
        status: "ok",
        statusCode: 200,
        data: rows,
        meta: {
          pagination: {
            totalItems: count,
            totalPages,
            currentPage,
            limit: options.limit,
          },
          filters: count === 0 ? {} : query.query,
        },
        //queryStats: query.getStats(),
      };

      logger.query({
        qeuryString: this.queryString,
        filter: response?.meta?.filters,
        queryStats: response.queryStats,
      });

      return response;
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
      logger.error({
        ...response,
        errorDetails: error,
      });
      console.log(error);

      return response;
    }
  }

  async readAService() {
    try {
      const record = await this.tableModel.findByPk(this.id);
      //   console.log("A single read:", record);
      if (!record) {
        const response = {
          message: "Data not found with this ID",
          status: "error",
          statusCode: 404,
        };
        // logger.error(response);
        return response;
      }
      const response = {
        message: "Data successfully fetched",
        status: "ok",
        data: record,
        statusCode: 200,
      };
      return response;
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
      logger.error({
        ...response,
        errorDetails: error,
      });

      console.log(error);

      return response;
    }
  }

  async readAuthUserService() {
    try {
      const user = await this.userTableModel.findByPk(this.authID);

      if (!user) {
        const response = {
          message: "User not found",
          status: "error",
          statusCode: 404,
        };
        // logger.error(response);
        return response;
      }

      const query = new QueryBuilder(
        queryString
        //association
      );

      const options = query.build();
      const { count, rows } = await tableModel.findAndCountAll(options);

      const totalPages = Math.ceil(count / options.limit);
      if (queryString.page > totalPages && count > 0) {
        options.offset = (totalPages - 1) * options.limit;
      }
      const currentPage = Math.floor(options.offset / options.limit) + 1;

      const formattedRows = rows.map((row) => row.get({ plain: true }));

      const response = {
        success: true,
        message: count === 0 ? "No data found" : "Data successfully fetched",
        status: "ok",
        data: formattedRows,
        meta: {
          pagination: {
            totalItems: count,
            totalPages,
            currentPage,
            limit: options.limit,
          },
          filters: count === 0 ? {} : query.query,
        },
      };

      logger.query({
        qeuryString: this.queryString,
        filter: response?.meta?.filters,
        queryStats: response.queryStats,
      });

      return response;
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };

      logger.error({
        ...response,
        errorDetails: error,
      });
      return response;
    }
  }

  async createService() {
    let dbTransaction;
    try {
      const {
        mainModel, // The model we're creating a record for
        userModel, // User model for validation
        associationConfig, // Configuration for associated models
        customFields = {}, // Custom field mappings
      } = this.modelconfig;

      const { user_custom_id, assoc_custom_id, ...recordData } = this.data;
      dbTransaction = await this.sequelize.dbTransaction();

      // 1. Validate user
      const user = await userModel.findOne({
        where: { custom_id: user_custom_id },
        attributes: ["custom_id"],
        dbTransaction,
      });

      if (!user) {
        const response = {
          message: "User not found",
          status: "error",
          statusCode: 404,
        };
        if (dbTransaction) await dbTransaction.rollback();
        // logger.error(response);
        return response;
      }

      // 2. Prepare base record data
      const baseRecordData = {
        ...recordData,
        user_custom_id: user?.custom_id,
        // description: customFields.defaultDescription || "incomplete",
      };

      // 3. Handle associated record if provided
      if (assoc_custom_id && associationConfig) {
        const {
          model: associatedModelPromise,
          customIdField,
          updateFields = [],
        } = associationConfig;

        try {
          const associatedModel = await associatedModelPromise;
          const associatedRecord = await associatedModel.findOne({
            where: {
              custom_id: assoc_custom_id,
            },
            attributes: ["id", "custom_id"],
            dbTransaction,
          });

          //   console.log(associatedRecord);
          if (!associatedRecord) {
            if (dbTransaction) await dbTransaction.rollback();

            return {
              message: "Related record not found",
              status: "error",
              statusCode: 404,
            };
          }

          // Update associated record if needed
          if (updateFields.length > 0) {
            const updateData = {};
            updateFields.forEach((field) => {
              if (data[field] !== undefined) {
                updateData[field] = data[field];
              }
            });

            if (Object.keys(updateData).length > 0) {
              await associatedModel.update(updateData, {
                where: { custom_id: associatedRecord.custom_id },
                dbTransaction,
              });
            }
          }

          // Add association custom ID to base record
          if (customIdField) {
            baseRecordData[customIdField] = associatedRecord.custom_id;
          }
        } catch (assocError) {
          console.error("Error handling associated record:", assocError);
          if (dbTransaction) await dbTransaction.rollback();
          const response = {
            message: "Error handling associated record",
            status: "error",
            statusCode: 500,
            serverError: assocError.message,
          };
          logger.error({
            ...response,
            errorDetails: error,
          });
          return response;
        }
      }

      // 4. Create the record
      const record = await mainModel.create(baseRecordData, { dbTransaction });

      if (!record) {
        await dbTransaction.rollback();
        return {
          message: "Data not created",
          status: "error",
          statusCode: 400,
        };
      }
      await dbTransaction.commit();
      return {
        message: "Data successfully created",
        status: "ok",
        data: record,
      };
    } catch (error) {
      console.error("Error creating record:", error);
      await dbTransaction.rollback();
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
      logger.error({
        ...response,
        errorDetails: error,
      });

      return response;
    }
  }

  async updateService() {
    try {
      const user = await this.userTableModel.findOne({
        where: { custom_id: this.data.user_custom_id },
        attribuites: ["id", "custom_id"],
      });
      if (!user) {
        return (data = {
          message: "User not found",
          status: "error",
          statusCode: 404,
        });
      }
      const updatedRecord = await this.tableModel.update(
        { ...this.data },
        {
          where: { id: this.id, user_custom_id: user.custom_id },
        }
      );

      if (!updatedRecord) {
        return (data = {
          message: "Data not updated",
          status: "error",
          statusCode: 400,
        });
      }
      return (data = {
        message: "Data successfully updated",
        status: "ok",
        // statusCode: 200,
      });
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
      logger.error({
        ...response,
        errorDetails: error,
      });

      return response;
    }
  }
  async deleteService() {
    try {
      // const user = await this.userTableModel.findOne({
      //   where: { id: this.authID },
      //   attribuites: ["id", "custom_id"],
      // });
      // if (!user) {
      //   return (data = {
      //     message: "User not found",
      //     status: "error",
      //     statusCode: 404,
      //   });
      // }

      const deletedRecord = await this.tableModel.destroy({
        where: { id: this.id /*user_custom_id: user.custom_id */ },
      });
      if (!deletedRecord) {
        const response = {
          message: "Operation failed! data not found",
          status: "error",
          statusCode: 404,
        };
        return response;
      }
      const response = {
        message: "Data successfully deleted",
        status: "ok",
        statusCode: 201,
      };
      return response;
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
      logger.error({
        ...response,
        errorDetails: error,
      });

      return response;
    }
  }
}

module.exports = CrudOperation;
