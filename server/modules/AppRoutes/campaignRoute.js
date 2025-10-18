const db = require("../../shared/dbConfig/config");

class CampaignEndpoints {
  constructor(router) {
    this.router = router;
    this.campaignDetais(router);
    this.campaignCatergories(router);
    this.campaignCatergoriesTypes(router);
    this.campaignMilestone(router);
    this.campaignPartners(router);
    this.campaignMedia(router);
    this.baseURI = "/api/v1.0";

    return this;
  }

  campaignDetais(router) {
    router.get("/api/campaigns", (req, res) => {
      try {
        // Joins  use the campain id
        // No this when More details is clicked - frontend
        // Join to campaign milestone table and present a nice use friendly statiscal Ui
        res.json({
          message: "success",
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error.message,
        });
      }
    });
  }

  campaignCatergories(router) {
    router.get("/api/v1.0/campaign_categories", async (req, res) => {
      const model = db.models["campaign_categories"];
      try {
        const response = await model.findAll();
        res.json({
          status: "Ok",
          message: "Operation Successfull!",
          data: response,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error?.message,
        });
      }
    });
  }

  campaignCatergoriesTypes(router) {
    router.post("/api/v1.0/get_categories_types", async (req, res) => {
      try {
        const { record } = req.body;
        const model = db.models["campaign_types"];

        const response = await model.findAll({
          where: { category_id: record },
        });
        res.json({
          status: "Ok",
          message: "Operation Successfull!",
          data: response,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error?.message,
        });
      }
    });
  }

  campaignMilestone(router) {
    router.post("/api/v1.0/campaign_milestones", async (req, res) => {
      try {
        const { campaign_id } = req.body;

        const model = db.models["campaign_milestones"];
        const response = await model.findAll({
          where: { campaign_id: campaign_id },
        });
        res.json({
          status: "Ok",
          message: "Operation Successfull!",
          data: response,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error?.message,
        });
      }
    });
  }
  campaignPartners(router) {
    router.post("/api/v1.0/campaign_partners", async (req, res) => {
      try {
        const { campaign_id } = req.body;

        const model = db.models["campaign_partners"];
        const response = await model.findAll({
          where: { campaign_id: campaign_id },
        });
        res.json({
          status: "Ok",
          message: "Operation Successfull!",
          data: response,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error?.message,
        });
      }
    });
  }

  campaignMedia(router) {
    router.post("/api/v1.0/campaign_media", async (req, res) => {
      try {
        const { campaign_id } = req.body;

        const model = db.models["campaign_media"];
        const response = await model.findAll({
          where: { campaign_id: campaign_id },
        });
        res.json({
          status: "Ok",
          message: "Operation Successfull!",
          data: response,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: "Operation Failed!",
          serverError: error?.message,
        });
      }
    });
  }
}

module.exports = CampaignEndpoints;
