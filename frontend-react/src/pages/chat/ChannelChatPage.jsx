import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../services/ApiService";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ChannelChat.css";
import { socket } from "../../socket";

const ChannelChatPage = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [msgError, setMsgError] = useState("");
  const [channelInfo, setChannelInfo] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Fetch channel info and join socket room
  useEffect(() => {
    const fetchChannel = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await ApiService.request(
          `/chat/channel/${channelId}`,
          "GET",
          null,
          token
        );
        setChannelInfo(res.data);
      } catch {
        setChannelInfo(null);
      }
    };
    fetchChannel();

    // join room
    socket.emit("joinChannel", channelId);

    return () => {
      socket.emit("leaveChannel", channelId);
    };
  }, [channelId]);

  // Initial fetch of messages (normalize to oldest-first)
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setMsgError("");
      try {
        const token = localStorage.getItem("token");
        const res = await ApiService.request(
          `/chat/messages/${channelId}`,
          "GET",
          null,
          token
        );
        const data = res.data;
        let initial = [];
        if (Array.isArray(data?.messages)) {
          // API returns newest first, so reverse to oldest -> newest
          initial = [...data.messages].reverse();
        } else if (Array.isArray(data)) {
          initial = [...data];
        }
        setMessages(initial);
        setMsgError("");
      } catch {
        setMessages([]);
        setMsgError("Could not load messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [channelId]);

  // Listen for newMessage from socket
  useEffect(() => {
    const handler = (msg) => {
      // Append at end so newest is at bottom
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", handler);
    return () => {
      socket.off("newMessage", handler);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    try {
      // Use REST so auth + validation stay same
      const res = await ApiService.request(
        "/chat/send-message",
        "POST",
        { channelId, message: text },
        token
      );
      // Optimistic add in case socket emit is slightly delayed
      console.log("sent message responsreeeeeeeeeeeeeeeeeeeeeeeeeeeee", res.data);
      setMessages((prev) => [...prev, res.data]);
      // Also emit through socket so the other side gets it
      socket.emit("sendMessage", { channelId, message: text });
      setText("");
    } catch {
      // optionally handle error
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    const token = localStorage.getItem("token");
    try {
      await ApiService.request(
        `/chat/message/${messageId}`,
        "DELETE",
        null,
        token
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch {
      // optionally handle error
    }
  };

  const isMyMessage = (m) =>
    { console.log("is my meessssageeeeeeeeeeeeeee",m);
      return m.sender?._id === user.userID || m.sender === user.userID};

  // Header: doctor sees patient name; patient sees channel name
  const headerTitle = (() => {
    if (!channelInfo) return "Channel Chat";
    console.log("user roleeeeeeeeeeeeee ", user.role);
    if (user.role === "Doctor") {
      console.log("channel infooooooooooooooo members ", channelInfo);
      // find the approved member (patient) and show their name or id
      const approvedMember =
        channelInfo.members &&
        channelInfo.members.find((m) => m.status === "approved");
        console.log("approved memberttttttttttt ", approvedMember);
      return approvedMember?.user.fullName || approvedMember?.user || channelInfo.name;
    }
    // patient side: show channel name
    return channelInfo.name || channelInfo.doctor?.fullName || "Channel Chat";
  })();

  const headerAvatar =
    headerTitle && typeof headerTitle === "string"
      ? headerTitle[0]
      : channelInfo?.name?.[0] || "C";

  return (
    <div className="chat-outer-wrap">
      <div className="chat-header">
        <div className="chat-avatar">{headerAvatar}</div>
        <div className="chat-title">{headerTitle}</div>
      </div>

      <div className="chat-body">
        {loading && <div className="chat-loading">Loading...</div>}

        {msgError && !loading && (
          <div style={{ color: "#c44", margin: 14 }}>{msgError}</div>
        )}

        {!loading &&
          !msgError &&
          Array.isArray(messages) &&
          messages.length === 0 && (
            <div className="chat-empty">No messages yet. Say hello!</div>
          )}

        {!loading &&
          !msgError &&
          Array.isArray(messages) &&
          messages.length > 0 &&
          messages.map((m, idx) => (
            <div
              key={m._id || idx}
              className={`chat-message-row ${
                isMyMessage(m) ? "my-message" : "their-message"
              }`}
            >
              <div className="chat-message-bubble">
                {m.message}
                <div className="chat-message-meta">
                  <span>{m.sender?.fullName}</span>
                  &nbsp;·&nbsp;
                  <span style={{ fontSize: ".95em" }}>
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString()
                      : ""}
                  </span>
                  {isMyMessage(m) && (
                    <button
                      className="chat-delete-btn"
                      onClick={() => handleDeleteMessage(m._id)}
                      title="Delete Message"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-bar">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChannelChatPage;
