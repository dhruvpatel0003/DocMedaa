import Article from "../models/article.js";

export const createArticle = async (req, res) => {
  try {
    if(req.user.role !== "Doctor" && req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Only Doctors and Admins can create articles" });
    }
    const { title, description, category, author, imageUrl, resources } = req.body;
    const article = new Article({ title, description, category, author, imageUrl, resources });
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

export const deleteArticle = async (req, res) => {
  try {
    if(req.user.role !== "Doctor" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden: Only Doctors and Admins can delete articles" });
    }
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    if(req.user.role !== "Doctor" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden: Only Doctors and Admins can update articles" });
    }
    const { title, description, category, author, imageUrl, resources } = req.body;
    const article = await Article.findByIdAndUpdate(req.params.id, { title, description, category, author, imageUrl, resources }, { new: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Error updating article", error: error.message });
  }
};