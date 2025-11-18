import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../services/ApiService";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ChannelChat.css"; // Your common CSS!

const ChannelChatPage = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [msgError, setMsgError] = useState("");
  const [channelInfo, setChannelInfo] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

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
  }, [channelId]);

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
        if (Array.isArray(res.data)) {
          setMessages(res.data);
          setMsgError("");
        } else if (res.data && res.data.message) {
          setMessages([]);
          setMsgError(res.data.message);
        } else {
          setMessages([]);
          setMsgError("");
        }
      } catch {
        setMessages([]);
        setMsgError("Could not load messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [channelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await ApiService.request(
        "/chat/send-message",
        "POST",
        { channelId, message: text },
        token
      );
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch {}
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
    } catch {}
  };

  const isMyMessage = (m) =>
    m.sender?._id === user._id || m.sender === user._id;

  return (
    <div className="chat-outer-wrap">
      <div className="chat-header">
        <div className="chat-avatar">
          {channelInfo?.doctor?.fullName
            ? channelInfo.doctor.fullName[0]
            : channelInfo?.name
            ? channelInfo.name[0]
            : "D"}
        </div>
        <div className="chat-title">
          {channelInfo?.doctor?.fullName ||
            channelInfo?.name ||
            "Channel Chat"}
        </div>
      </div>
      <div className="chat-body">
        {loading && <div className="chat-loading">Loading...</div>}
        {msgError && !loading && (
          <div style={{ color: "#c44", margin: 14 }}>{msgError}</div>
        )}
        {!loading && !msgError && Array.isArray(messages) && messages.length === 0 && (
          <div className="chat-empty">No messages yet. Say hello!</div>
        )}
        {!loading && !msgError && Array.isArray(messages) && messages.length > 0 &&
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
