const validateModel = (models) => {
  return (req, res, next) => {
    const modelName = req.params.resources.toLowerCase();

    // console.log(models);
    // Access the model directly from models object
    const Model = models[modelName];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: `Invalid resource: ${modelName} model not found`,
      });
    }

    // Attach the model to the request object
    req.model = Model;
    next();
  };
};

module.exports = validateModel;
