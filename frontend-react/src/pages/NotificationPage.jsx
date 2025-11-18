import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { showSnackBar } from "../utils/helpers";
import "../styles/notificationPage.css";    
import "../styles/help.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await ApiService.request(
        "/notifications/",
        "GET",
        null,
        token
      );
      setNotifications(res.data?.notifications || []);
    } catch {
      showSnackBar("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await ApiService.request(`/notifications/${id}/read`, "PUT", null, token);
      setNotifications((n) =>
        n.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch {}
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all notifications? This cannot be undone."))
      return;
    setClearing(true);
    try {
      await ApiService.request("/notifications/clear", "DELETE", null, token);
      setNotifications([]);
      showSnackBar("All notifications cleared.");
    } catch {
      showSnackBar("Failed to clear notifications.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="notifications-page">
      <button
        className="back-dashboard-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <button
            className="clear-all-btn"
            onClick={clearAll}
            disabled={clearing}
            title="Delete all notifications"
          >
            {clearing ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className={`notification-card${notif.isRead ? " read" : ""}`}
          >
            <div className="notif-title">{notif.title}</div>
            <div className="notif-message">{notif.message}</div>
            <div className="notif-meta">
              <span>{new Date(notif.createdAt).toLocaleString()}</span>
              {!notif.isRead && (
                <button
                  className="btn-mark-read"
                  onClick={() => markAsRead(notif._id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsPage;
