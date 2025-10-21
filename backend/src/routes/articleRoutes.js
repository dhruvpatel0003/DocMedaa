import express from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
} from "../controllers/articleController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllArticles);
router.get("/:id", getArticleById);

router.post("/new-article", authMiddleware, createArticle);

export default router;
