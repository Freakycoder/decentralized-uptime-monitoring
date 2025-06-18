let socket: WebSocket | null;

interface registrationMessage {
  [register_validator : string]: {
    validator_id: string,
    location: {
      latitude: number,
      longitude: number
    }
  }
}

interface performanceData {
  url: string,
  timestamp: Date,
  runNumber: number,
  totalRuns: number,
  dnsLookup: number,
  tcpConnection: number,
  tlsHandshake: number,
  ttfb: number,
  contentDownload: number,
  totalDuration: number,
  statusCode: number,
}

interface websocketMessage {
  socket: WebSocket,
  message: registrationMessage | performanceData,
  setSocketStatus: (status: { connected: boolean, connecting: boolean, error: string | null }) => void
}

interface initializeSocket {
  wsUrl: string,
  setSocketStatus: (status: { connected: boolean, connecting: boolean, error: string | null }) => void
}

export function initSocket({ wsUrl, setSocketStatus }: initializeSocket) : Promise<WebSocket> {

  return new Promise((resolve, reject) => {
    try {
      setSocketStatus({ connected: false, connecting: true, error: null })
      console.log('🌐 Connecting to WebSocket:', wsUrl);
      socket = new WebSocket(wsUrl);
      console.log('Connected to websocket');
      return resolve(socket);
    }
    catch (error) {
      console.error('❌ Error establishing WebSocket connection:', error);
      setSocketStatus({
        connected: false,
        connecting: false,
        error: 'Failed to establish connection'
      });
      return reject(error)
    }
  })
}

export function sendMessage({ socket, message, setSocketStatus }: websocketMessage): Promise<void> {

  return new Promise((resolve, reject) => {
    const messageString = JSON.stringify(message);
    if (!socket) {
      console.warn("socket is null");
      return reject(new Error('socket is null'));
    }

    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageString);
        console.log('message sent immediatly');
        resolve();
      }
      catch (err) {
        console.error('error sending message: ', err);
        reject(err)
      }
    }

    else if (socket.readyState === WebSocket.CONNECTING) {
      socket.onopen = () => {
        try {
          console.log("✅ WebSocket connected successfully (from .onopen)");
          setSocketStatus({ connected: true, connecting: false, error: null });

          setTimeout(() => {
            socket.send(messageString);
            console.log("✅ Message sent after connection!");
            resolve();
          }, 500);
        } catch (err) {
          console.error("❌ Failed to send message after connecting:", err);
          reject(err);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket connection failed:", err);
        setSocketStatus({
          connected: false,
          connecting: false,
          error: "Failed to connect to socket",
        });
        reject(new Error("WebSocket connection failed"));
      };
    }

    else {
      console.warn("⚠️ Socket not in a valid state:", socket.readyState);
      reject(new Error("Socket is not open or connecting"));
    }
  })
}

export function listeningMessage(socket: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', message);

        if (!message.url) {
          return reject(new Error('No URL recieved'));
        }
        console.log('🌐 Received website monitoring task:', message.url);
        resolve(message.url);
      }
      catch (e) {
        console.error("error parsing websocket message: ", e)
      }
    }
  })
}

export function getSocket(): WebSocket | null {
  return socket;
}
