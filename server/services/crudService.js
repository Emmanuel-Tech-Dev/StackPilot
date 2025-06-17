const db = require("../dbConfig/config");
const QueryBuilder = require("../helpers/queryUtils");
const ResponseHandler = require("../middleWare/responseHandler");

class CrudOperation {
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
  }

  async readService() {
    try {
      const query = new QueryBuilder(this.queryString, this.association, {
        maxLimit: 500,
        enableCache: true,
        enableFullTextSearch: true,
        enableQueryLogging: true,
        queryTimeout: 15000,
      });
      const options = query.build();

      console.log("All options form query string", options);

      const { count, rows } = await this.tableModel.findAndCountAll(options);

      const totalPages = Math.ceil(count / options.limit);
      if (this.queryString.page > totalPages && count > 0) {
        options.offset = (totalPages - 1) * options.limit;
      }
      const currentPage = Math.floor(options.offset / options.limit) + 1;

      // Format the response data
      const formattedRows = rows.map((row) => row.get({ plain: true }));

      // response._statusCode = count === 0 ? 404 : 200;
      // response._message =
      //   count === 0 ? "No data found" : "Data successfully fetched";
      // response._status = "ok";
      // response._data = formattedRows;
      // response._metadata = {
      //   pagination: {
      //     totalItems: count,
      //     totalPages,
      //     currentPage,
      //     limit: options.limit,
      //   },
      //   filters: count === 0 ? {} : query.query,
      // };

      console.log(query.getRecommendedIndexes());
      const response = {
        success: true,
        message: count === 0 ? "No data found" : "Data successfully fetched",
        status: "ok",
        statusCode: 200,
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
        queryStats: query.getStats(),
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

      console.log(error);

      return response;
    }
  }

  async readAuthUserService() {
    try {
      const user = await this.userTableModel.findByPk(this.authID);

      if (!user) {
        throw "User not found";
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

      return response;
    } catch (error) {
      const response = {
        success: false,
        message: "Operation failed!",
        errorMessage: error.message,
        status: "error",
        statusCode: 404,
      };
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
        return {
          message: "User not found",
          status: "error",
          statusCode: 404,
        };
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
          return {
            message: "Error handling associated record",
            status: "error",
            statusCode: 500,
            serverError: assocError,
          };
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
      return {
        message: "Internal server error",
        status: "error",
        statusCode: 500,
      };
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
      throw new Error(`Read operation failed: ${error.message}`);
    }
  }
  async deleteService() {
    try {
      const user = await this.userTableModel.findOne({
        where: { id: this.data.userID },
        attribuites: ["id", "custom_id"],
      });
      if (!user) {
        return (data = {
          message: "User not found",
          status: "error",
          statusCode: 404,
        });
      }

      const deletedRecord = await this.tableModel.destroy({
        where: { id: this.id, user_custom_id: user.custom_id },
      });
      if (!deletedRecord) {
        return (data = {
          message: "Data not deleted",
          status: "error",
          statusCode: 400,
        });
      }
      return (data = {
        message: "Data successfully deleted",
        status: "ok",
        statusCode: 201,
      });
    } catch (error) {
      throw new Error(`Read operation failed: ${error.message}`);
    }
  }
}

module.exports = CrudOperation;
