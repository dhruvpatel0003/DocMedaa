// src/socket.js
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const socket = io(API_BASE, {
  auth: {
    token: localStorage.getItem("token"),
  },
});
