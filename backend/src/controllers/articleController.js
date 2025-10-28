import Article from "../models/article.js";
import Patient from "../models/patient.js";
import Doctor from "../models/doctor.js";

export const createArticle = async (req, res) => {
  try {
    if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
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
    const { category } = req.query;
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

export const toggleBookmark = async (req, res) => {
  try {
    const { id: articleId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    let user =
      userRole === "Doctor"
        ? await Doctor.findOne({ _id: userId })
        : await Patient.findOne({ _id: userId });

    if (!user) return res.status(404).json({ message: "User not found" });
    const isArticleExist = await Article.findById(articleId);
    if (!isArticleExist) {
      return res.status(404).json({ message: "Article not found" });
    }
    const index = user.bookmarks.indexOf(articleId);
    if (index === -1) {
      user.bookmarks.push(articleId);
      await user.save();
      return res.status(200).json({ message: "Article bookmarked" });
    } else {
      user.bookmarks.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: "Bookmark removed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user.id;
    const userRole = req.user.role;
    // console.log(userRole === "Doctor",user,userId,userRole);
    console.log("insideeeeeeeeeeeee");

    let user =
      userRole === "Doctor"
        ? await Doctor.findOne({ _id: userId }).populate("bookmarks")
        : await Patient.findOne({ _id: userId }).populate("bookmarks");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};