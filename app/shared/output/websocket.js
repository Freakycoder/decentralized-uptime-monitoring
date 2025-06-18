"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.sendMessage = sendMessage;
exports.getSocket = getSocket;
const ws_1 = __importDefault(require("ws"));
let socket;
function initSocket(url) {
    if (!socket || socket.readyState !== ws_1.default.OPEN) {
        socket = new ws_1.default(url);
        socket.onopen = () => {
            console.log("✅ WebSocket connected");
        };
        socket.onmessage = (event) => {
            console.log("📨 Received:", event.data);
        };
        socket.onclose = () => {
            console.log("❌ WebSocket disconnected");
        };
    }
}
function sendMessage(data) {
    if (socket && socket.readyState === ws_1.default.OPEN) {
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        socket.send(msg);
    }
    else {
        console.warn("⚠️ Socket not open");
    }
}
function getSocket() {
    return socket;
}
