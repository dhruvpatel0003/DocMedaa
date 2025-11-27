// src/hooks/useRealtimeNotifications.js
import { useEffect, useState } from "react";
import { socket } from "../socket";

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, setNotifications, unreadCount };
};
