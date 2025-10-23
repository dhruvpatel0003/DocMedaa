const express = require("express");
const  {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.post("/new-article", authMiddleware, createArticle);
router.post("/update-article/:id", authMiddleware, updateArticle);
router.delete("/delete-article/:id", authMiddleware, deleteArticle);

module.exports = router;
