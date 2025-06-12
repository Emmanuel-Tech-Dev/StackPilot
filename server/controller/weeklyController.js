const { handleErrorResponse } = require("../middleWare/errorHandler");
const { Week, TwelveWeekYear, User } = require("../model");
const createService = require("../services/crudService/createService");
const deleteService = require("../services/crudService/deleteService");
const {
  readService,
  readAService,
  readUserServices,
} = require("../services/crudService/readService");
const updateService = require("../services/crudService/updateService");

const getAllRecords = async (req, res) => {
  try {
    const queryString = req.query;
    const association = {
      user: {
        model: User,
        attributes: ["name"],
      },
    };

    const data = await readService(queryString, Week, association);

    return res.status(200).json({
      ...data,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, 500, "internal server error", "error");
  }
};

const getARecord = async (req, res) => {
  try {
    const { id } = req.params;
    // if (!id) return handleErrorResponse(res, 400, "ID is required", "error");
    const data = await readAService(id, Week);

    // if (!data?.data)
    //   return handleErrorResponse(res, 404, "Data not found", "error");

    statusCode = data?.statusCode || 200;

    return res.status(statusCode).json({
      ...data,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, 500, "internal server error", "error");
  }
};

const getAuthUserRecords = async (req, res) => {
  try {
    // const user = req.user;
    const { userID } = req.body;
    const queryString = req.query;
    // if (!user) return handleErrorResponse(res, 404, "User not found", "error");

    const data = await readUserServices(userID, queryString, Week, User);

    if (!data)
      return handleErrorResponse(
        res,
        200,
        "No Goals found for this user",
        "ok"
      );

    return res.status(200).json({
      ...data,
    });
  } catch (error) {
    console.log(error);
    const newError = error || "internal server error";
    const statusCode = error === "User not found" ? 404 : 500;
    return handleErrorResponse(res, statusCode, newError, "error");
  }
};

const createARecord = async (req, res) => {
  try {
    const data = req.body;

    const { userID, name } = data;

    if (!userID || !name)
      return handleErrorResponse(
        res,
        400,
        "userID and name is required",
        "error"
      );

    const newData = await createService(
      data,
      Week,
      User,
      TwelveWeekYear,
      "twelve_week_year_custom_id"
    );

    if (newData.status === "error")
      return handleErrorResponse(
        res,
        newData.statusCode,
        newData.message,
        "error"
      );

    return res.status(201).json({
      ...newData,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, 500, "internal server error", "error");
  }
};

const updateARecord = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    if (!data)
      return handleErrorResponse(res, 404, "missing required fields", "error");

    const updateDate = await updateService(data, id, Week, User);
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
};
const deleteARecord = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!data)
      return handleErrorResponse(res, 404, "missing required fields", "error");

    const deleteDate = await deleteService(data, id, Week, User);
    if (deleteDate.status === "error")
      return handleErrorResponse(
        res,
        deleteDate.statusCode,
        deleteDate.message,
        "error"
      );

    return res.status(200).json({ ...deleteDate });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, 500, "internal server error", "error");
  }
};

module.exports = {
  getAllRecords,
  getARecord,
  getAuthUserRecords,
  createARecord,
  updateARecord,
  deleteARecord,
};
