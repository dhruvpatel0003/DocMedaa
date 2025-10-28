const express = require("express");
const  {
  createArticle,
  getAllArticles,
  getArticleById,
} = require("../controllers/articleController.js");
const authMiddleware = require("../middleware/auth.js");
const { toggleBookmark, getBookmarks } = require("../controllers/articleController.js");

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);

router.post("/new-article", authMiddleware, createArticle);

router.post("/:id/bookmark", authMiddleware, toggleBookmark);
router.get("/bookmarks/:userId", authMiddleware, getBookmarks); //UserID need to be removed later from params

module.exports = router;
