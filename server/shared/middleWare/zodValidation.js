const logger = require("./logger");

module.exports = function validateSchema(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      logger.error({
        message: `Validation failed ith schema : ${schema}`,
        errors: result.error.errors,
      });

      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
};
