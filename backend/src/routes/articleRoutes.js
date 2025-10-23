const express = require("express");
const  {
  createArticle,
  getAllArticles,
  getArticleById,
} = require("../controllers/articleController.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);

router.post("/new-article", authMiddleware, createArticle);

module.exports = router;
