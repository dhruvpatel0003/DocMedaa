import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { showSnackBar } from "../utils/helpers";
import { AppConstants } from "../constants/AppConstants";
import "../styles/resourcePage.css";

const theme = AppConstants;

const categories = ["All", "Nutrition", "Mental Health", "Fitness", "General"];

const ResourcesPage = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === AppConstants.roleDoctor;

  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "General",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
    fetchBookmarks();
    // eslint-disable-next-line
  }, [selectedCategory, showBookmarked]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await ApiService.request(
        selectedCategory !== "All"
          ? `/articles?category=${selectedCategory}`
          : "/articles",
        "GET",
        null,
        token
      );
      setArticles(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackBar("Failed to load articles");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await ApiService.request(
        `/articles/bookmarks/${user?.id}`,
        "GET",
        null,
        token
      );
      setBookmarks(
        Array.isArray(res.data?.bookmarks) ? res.data.bookmarks : []
      );
    } catch {
      setBookmarks([]);
    }
  };

  const toggleBookmark = async (articleId) => {
    try {
      const res = await ApiService.request(
        `/articles/${articleId}/bookmark`,
        "POST",
        null,
        token
      );
      if (res.success) {
        fetchBookmarks();
        fetchArticles();
        showSnackBar(res.data.message || "Bookmark updated");
      }
    } catch {
      showSnackBar("Could not toggle bookmark");
    }
  };

  // Doctor only: add article
  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) {
      showSnackBar(AppConstants.allFieldsRequired);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.request(
        "/articles/new-article",
        "POST",
        { ...newArticle, author: user.fullName },
        token
      );
      if (res.success) {
        showSnackBar("Article created!");
        setShowAddModal(false);
        setNewArticle({
          title: "",
          content: "",
          category: "General",
          imageUrl: "",
        });
        fetchArticles();
      }
    } catch {
      showSnackBar("Failed to add article");
    } finally {
      setLoading(false);
    }
  };

  // Doctor only: update article
  const handleEditClick = (article) => {
    setEditArticle({ ...article });
    setShowEditModal(true);
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    if (!editArticle.title || !editArticle.content) {
      showSnackBar(AppConstants.allFieldsRequired);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.request(
        `/articles/${editArticle._id}`,
        "PUT",
        editArticle,
        token
      );
      if (res.success) {
        showSnackBar("Article updated!");
        setShowEditModal(false);
        setEditArticle(null);
        fetchArticles();
      }
    } catch {
      showSnackBar("Failed to update article");
    } finally {
      setLoading(false);
    }
  };

  // Defensive mapping
  const displayedArticles = Array.isArray(showBookmarked ? bookmarks : articles)
    ? showBookmarked
      ? bookmarks
      : articles
    : [];

  return (
    <div className="resources-page">
      {/* <button
        className="back-dashboard-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button> */}
       <div style={{ marginBottom: theme.mediumSizeBoxHeight }}>
          <a
            href="/dashboard"
            style={{
              color: theme.themeColor,
              textDecoration: "none",
              fontSize: theme.fontMedium,
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      <div className="resources-header">
        <h1>Health Resources</h1>
        <div className="resources-toolbar">
          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            className={`toggle-bookmarks ${showBookmarked ? "active" : ""}`}
            onClick={() => setShowBookmarked(!showBookmarked)}
          >
            {showBookmarked ? "Show All" : "Show Bookmarks"}
          </button>
          {/* Only doctors can add resources */}
          {isDoctor && (
            <button
              className="add-article-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Resource
            </button>
          )}
        </div>
      </div>

      <div className="resources-list">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : displayedArticles.length === 0 ? (
          <div className="no-resources">No resources found.</div>
        ) : (
          displayedArticles.map((article) => (
            <div
              className="resource-card magazine-card"
              key={article._id}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                // Only follow card click if the target is not inside resource-actions
                if (e.target.closest(".resource-actions")) return;
                navigate(`/resources/${article._id}`);
              }}
            >
              {article.imageUrl && (
                <img
                  className="resource-image"
                  src={article.imageUrl}
                  alt={article.title}
                />
              )}
              <div className="resource-content">
                <span className="resource-category">{article.category}</span>
                <h2 className="resource-title">{article.title}</h2>
                <p className="resource-snippet">
                  {article.content && article.content.length > 120
                    ? article.content.slice(0, 120) + "..."
                    : article.content}
                </p>
                <span className="resource-author">By {article.author}</span>
                <div className="resource-actions">
                  {/* Both patients and doctors can bookmark */}
                  <button
                    className={`bookmark-btn ${
                      bookmarks.some((b) => b._id === article._id)
                        ? "bookmarked"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(article._id);
                    }}
                    title={
                      bookmarks.some((b) => b._id === article._id)
                        ? "Remove bookmark"
                        : "Bookmark"
                    }
                  >
                    {bookmarks.some((b) => b._id === article._id)
                      ? "★ Bookmarked"
                      : "☆ Bookmark"}
                  </button>
                  {/* Only doctors can edit */}
                  {isDoctor && (
                    <button
                      className="edit-btn"
                      title="Edit Article"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(article);
                      }}
                    >
                      ✎ Edit
                    </button>
                  )}
                </div>
                <button
                  className="read-more-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/resources/${article._id}`);
                  }}
                  style={{
                    marginTop: 8,
                    color: "#0052CC",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Read More &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Only doctors can see Add/Edit modals */}
      {isDoctor && showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Resource</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form className="add-article-form" onSubmit={handleAddArticle}>
              <label>Title</label>
              <input
                value={newArticle.title}
                onChange={(e) =>
                  setNewArticle((n) => ({ ...n, title: e.target.value }))
                }
                required
              />
              <label>Category</label>
              <select
                value={newArticle.category}
                onChange={(e) =>
                  setNewArticle((n) => ({ ...n, category: e.target.value }))
                }
                required
              >
                {categories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <label>Image URL (optional)</label>
              <input
                value={newArticle.imageUrl}
                onChange={(e) =>
                  setNewArticle((n) => ({ ...n, imageUrl: e.target.value }))
                }
              />
              <label>Content</label>
              <textarea
                value={newArticle.content}
                onChange={(e) =>
                  setNewArticle((n) => ({ ...n, content: e.target.value }))
                }
                rows={5}
                required
              />
              <div style={{ marginTop: 18, textAlign: "right" }}>
                <button className="save-btn" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDoctor && showEditModal && editArticle && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Resource</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form className="add-article-form" onSubmit={handleUpdateArticle}>
              <label>Title</label>
              <input
                value={editArticle.title}
                onChange={(e) =>
                  setEditArticle((n) => ({ ...n, title: e.target.value }))
                }
                required
              />
              <label>Category</label>
              <select
                value={editArticle.category}
                onChange={(e) =>
                  setEditArticle((n) => ({ ...n, category: e.target.value }))
                }
                required
              >
                {categories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <label>Image URL (optional)</label>
              <input
                value={editArticle.imageUrl}
                onChange={(e) =>
                  setEditArticle((n) => ({ ...n, imageUrl: e.target.value }))
                }
              />
              <label>Content</label>
              <textarea
                value={editArticle.content}
                onChange={(e) =>
                  setEditArticle((n) => ({ ...n, content: e.target.value }))
                }
                rows={5}
                required
              />
              <div style={{ marginTop: 18, textAlign: "right" }}>
                <button className="save-btn" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Update Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
