import Article from "../models/article.js";

export const createArticle = async (req, res) => {
  try {
    if(req.user.role !== "Doctor" && req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Only Doctors and Admins can create articles" });
    }
    const { title, content, category, author, imageUrl } = req.body;
    const article = new Article({ title, content, category, author, imageUrl });
    await article.save();
    res.status(201).json({ message: "Article created successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Error creating article", error: error.message });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const { category } = req.query; // optional filter by category
    const query = category ? { category } : {};
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching articles", error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Error fetching article", error: error.message });
  }
};
