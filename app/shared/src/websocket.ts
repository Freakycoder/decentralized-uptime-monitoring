import WebSocket from "ws";

let socket : WebSocket;

export function initSocket(url: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket(url);

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

export function sendMessage(data: string | object) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msg = typeof data === "string" ? data : JSON.stringify(data);
    socket.send(msg);
  } else {
    console.warn("⚠️ Socket not open");
  }
}

export function getSocket(): WebSocket | null {
  return socket;
}
