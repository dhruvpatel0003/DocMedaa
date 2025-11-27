<<<<<<< HEAD
const mongoose = require('mongoose');
=======
import mongoose from "mongoose";
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ["Nutrition", "Mental Health", "Fitness", "General"], default: "General" },
    author: { type: String, default: "DocMedaa Team" },
    imageUrl: { type: String }, // optional field
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);
<<<<<<< HEAD
module.exports = Article;
=======
export default Article;
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
