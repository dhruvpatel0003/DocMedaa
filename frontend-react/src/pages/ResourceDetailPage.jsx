import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import { showSnackBar } from "../utils/helpers";
import { AppConstants } from "../constants/AppConstants";
import "../styles/ResourceDetail.css";

const ArticleDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDoctor = user?.role === AppConstants.roleDoctor;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await ApiService.request(`/articles/${id}`, "GET", null, token);
      if (res.success || res.statusCode === 200) setArticle(res.data);
      else showSnackBar("Article not found");
    } catch {
      showSnackBar("Error loading article");
    } finally {
      setLoading(false);
    }
  };

  // Doctor delete logic
  const handleDelete = async () => {
    if (!window.confirm("Delete this article? This action is irreversible.")) return;
    try {
      const res = await ApiService.request(`/articles/${id}`, "DELETE", null, token);
      if (res.success) {
        showSnackBar("Article deleted!");
        navigate("/resources");
      }
    } catch {
      showSnackBar("Error deleting article");
    }
  };

  if (loading) return <div style={{ marginTop: "60px", textAlign: "center" }}>Loading...</div>;
  if (!article) return <div style={{ marginTop: "60px", textAlign: "center" }}>Article not found.</div>;

  return (
    <div className="article-detail-page">
      <div className="article-detail-card">
        {article.imageUrl && <img className="detail-image" src={article.imageUrl} alt={article.title} />}
        <span className="detail-category">{article.category}</span>
        <h1 className="detail-title">{article.title}</h1>
        <p className="detail-meta">By {article.author} | {new Date(article.createdAt).toLocaleDateString()}</p>
        <article className="detail-content">{article.content}</article>
        {isDoctor && (
          <button className="danger-btn" onClick={handleDelete} style={{ marginTop: 24 }}>
            Delete Article
          </button>
        )}
        <button className="back-btn" onClick={() => navigate("/resources")}>← Back to Resources</button>
      </div>
    </div>
  );
};

export default ArticleDetail;
