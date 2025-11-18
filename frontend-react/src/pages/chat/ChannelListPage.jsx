import React, { useState, useEffect } from "react";
import ApiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/ChannelChat.css";

const TABS_DOCTOR = [
  { key: "approved", label: "Chats" },
  { key: "pending", label: "Requests" },
  { key: "mychannels", label: "My Channels" }
];
const TABS_PATIENT = [
  { key: "approved", label: "Chats" },
  { key: "pending", label: "Pending" },
  { key: "all", label: "All Doctors" }
];

const ChannelListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [tab, setTab] = useState("approved");
  const isDoctor = user.role === "Doctor";

  const fetchChannels = async () => {
    const token = localStorage.getItem("token");
    const res = await ApiService.request("/chat/channels", "GET", null, token);
    setChannels(Array.isArray(res.data) ? res.data : []);
  };
  useEffect(() => { fetchChannels(); }, []);

  // Actions
  const requestJoin = async (channelId) => {
    await ApiService.request("/chat/request-join", "POST", { channelId }, localStorage.getItem("token"));
    fetchChannels();
  };
  const cancelJoin = async (channelId) => {
    await ApiService.request("/chat/cancel-request", "POST", { channelId }, localStorage.getItem("token"));
    fetchChannels();
  };
  const approveMember = async (channelId, patientId) => {
    await ApiService.request("/chat/approve-member", "POST", { channelId, patientId }, localStorage.getItem("token"));
    fetchChannels();
  };
  const removeMember = async (channelId, patientId) => {
    await ApiService.request("/chat/remove-member", "POST", { channelId, patientId }, localStorage.getItem("token"));
    fetchChannels();
  };
  const deleteChannel = async (channelId) => {
    await ApiService.request(`/chat/channel/${channelId}`, "DELETE", null, localStorage.getItem("token"));
    fetchChannels();
  };

  // List construction logic
  let list = [];
  if (isDoctor) {
    if (tab === "approved") {
      list = channels
        .flatMap(ch =>
          (ch.members || [])
            .filter(m => m.status === "approved")
            .map(m => ({ ...ch, patient: m }))
        );
    }
    if (tab === "pending") {
      list = channels
        .flatMap(ch =>
          (ch.members || [])
            .filter(m => m.status === "pending")
            .map(m => ({ ...ch, patient: m }))
        );
    }
    if (tab === "mychannels") {
      list = channels;
    }
  } else {
    if (tab === "approved") {
      list = channels.filter(ch =>
        Array.isArray(ch.members) &&
        ch.members.some(m => String(m.user) === String(user._id) && m.status === "approved")
      );
    }
    if (tab === "pending") {
      list = channels.filter(ch =>
        Array.isArray(ch.members) &&
        ch.members.some(m => String(m.user) === String(user._id) && m.status === "pending")
      );
    }
    if (tab === "all") {
      list = channels;
    }
  }

  // UI rendering
  return (
    <div style={{ maxWidth: 700, margin: "28px auto 0 auto" }}>
      <div className="channel-tabs">
        {(isDoctor ? TABS_DOCTOR : TABS_PATIENT).map(obj => (
          <button
            key={obj.key}
            className={`channel-tab${tab === obj.key ? " active" : ""}`}
            onClick={() => setTab(obj.key)}
          >
            {obj.label}
          </button>
        ))}
      </div>
      <div className="channel-list-section">
        {/* Doctor: create channel on My Channels tab */}
        {isDoctor && tab === "mychannels" && (
          <CreateChannelForm onCreated={fetchChannels} />
        )}
        {list.length === 0 && <div style={{ color: "#888", margin: "18px 0 0 12px" }}>Nothing to show yet.</div>}

        {/* Doctor: Approved, Requests, My Channels */}
        {isDoctor ? (
          <>
            {tab === "approved" && list.map((ch, idx) => (
              <div className="channel-list-card" key={ch._id + idx}>
                <div>
                  <div className="channel-info">{ch.name}</div>
                  <div className="channel-meta">Patient ID: {ch.patient.user} | approved</div>
                </div>
                <div className="channel-actions">
                  <button className="btn-open-chat"
                    onClick={() => navigate(`/chat/${ch._id}`)}>Open Chat</button>
                  <button className="btn-approve"
                    onClick={() => removeMember(ch._id, ch.patient.user)}>Remove</button>
                </div>
              </div>
            ))}
            {tab === "pending" && list.map((ch, idx) => (
              <div className="channel-list-card" key={ch._id + idx}>
                <div>
                  <div className="channel-info">{ch.name}</div>
                  <div className="channel-meta">Patient ID: {ch.patient.user} | pending</div>
                </div>
                <div className="channel-actions">
                  <button className="btn-approve"
                    onClick={() => approveMember(ch._id, ch.patient.user)}>Approve</button>
                  <button className="btn-approve"
                    onClick={() => removeMember(ch._id, ch.patient.user)}>Reject</button>
                </div>
              </div>
            ))}
            {tab === "mychannels" && list.map(ch => (
              <div className="channel-list-card" key={ch._id}>
                <div className="channel-info">{ch.name}</div>
                <div className="channel-actions">
                  <button className="btn-approve"
                    onClick={() => deleteChannel(ch._id)}>Delete Channel</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {tab === "approved" && list.map(ch => (
              <div className="channel-list-card" key={ch._id}>
                <div className="channel-info">{ch.name}</div>
                <div className="channel-actions">
                  <button className="btn-open-chat"
                    onClick={() => navigate(`/chat/${ch._id}`)}>Open Chat</button>
                  <button className="btn-approve"
                    onClick={() => removeMember(ch._id, user._id)}>Leave</button>
                </div>
              </div>
            ))}
            {tab === "pending" && list.map(ch => (
              <div className="channel-list-card" key={ch._id}>
                <div className="channel-info">{ch.name}</div>
                <div className="channel-actions">
                  <button className="btn-approve"
                    onClick={() => cancelJoin(ch._id)}>Cancel Request</button>
                </div>
              </div>
            ))}
            {tab === "all" && list.map(ch => {
              const m = Array.isArray(ch.members) &&
                ch.members.find(m_ => String(m_.user) === String(user._id));
              return (
                <div className="channel-list-card" key={ch._id}>
                  <div className="channel-info">{ch.name}</div>
                  <div className="channel-actions">
                    {!m ? (
                      <button className="btn-request"
                        onClick={() => requestJoin(ch._id)}>Request to Join</button>
                    ) : m.status === "pending" ? (
                      <button className="btn-approve"
                        onClick={() => cancelJoin(ch._id)}>Cancel Request</button>
                    ) : m.status === "approved" ? (
                      <button className="btn-open-chat"
                        onClick={() => navigate(`/chat/${ch._id}`)}>Open Chat</button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

const CreateChannelForm = ({ onCreated }) => {
  const [name, setName] = useState("");
  const submit = async e => {
    e.preventDefault();
    await ApiService.request(
      "/chat/create-channel",
      "POST",
      { name },
      localStorage.getItem("token")
    );
    setName("");
    onCreated();
  };
  return (
    <form onSubmit={submit} className="channel-create-form">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Channel name" required />
      <button type="submit">Create Channel</button>
    </form>
  );
};

export default ChannelListPage;
