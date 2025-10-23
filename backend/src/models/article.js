import mongoose from "mongoose";

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
export default Article;
