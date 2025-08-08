const logger = require("../../utils/logger");

const pageNotFound = async (req, res) => {
  try {
    res.render("page404");
  } catch (error) {
    logger.error("Error rendering 404 page: ", error);
    res.status(500).send("Error loading 404 page");
  }
};

const loadHomePage = async (req, res) => {
  try {
    return res.render("home");
  } catch (error) {
    logger.error("Home page not found");
    res.status(500).send("server error");
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
};
