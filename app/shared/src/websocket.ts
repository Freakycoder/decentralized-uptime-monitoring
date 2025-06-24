let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = true;
let currentWsUrl: string | null = null;
let currentSetSocketStatus: ((status: { connected: boolean; connecting: boolean; error: string | null }) => void) | null = null;
let globalMessageHandler: ((message: any) => void) | null = null; // this is a variable that stores a function.
interface RegistrationMessage {
  register_validator: {
    validator_id: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}

interface PerformanceData {
  url: string;
  timestamp: Date;
  runNumber: number;
  totalRuns: number;
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  ttfb: number;
  contentDownload: number;
  totalDuration: number;
  statusCode: number;
}

interface WebSocketMessage {
  socket: WebSocket;
  message: RegistrationMessage | PerformanceData | any;
  setSocketStatus: (status: { connected: boolean; connecting: boolean; error: string | null }) => void;
}

interface InitializeSocket {
  wsUrl: string;
  setSocketStatus: (status: { connected: boolean; connecting: boolean; error: string | null }) => void;
  validatorData?: {
    validatorId: string;
    latitude: number;
    longitude: number;
  };
  onMessage?: (message: any) => void; // Add global message handler
}

// Save validator data to localStorage for persistence across browser sessions
const saveValidatorData = (data: { validatorId: string; latitude: number; longitude: number }) => {
  localStorage.setItem('validator_connection_data', JSON.stringify(data));
};

// Load validator data from localStorage
const loadValidatorData = (): { validatorId: string; latitude: number; longitude: number } | null => {
  try {
    const data = localStorage.getItem('validator_connection_data');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Clear validator data (only when user manually disconnects)
const clearValidatorData = () => {
  localStorage.removeItem('validator_connection_data');
};

// Set up message listener for the socket
const setupSocketMessageListener = (websocket: WebSocket) => {
  websocket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 Received WebSocket message:', message);
      
      // Call the global message handler if it exists
      if (globalMessageHandler) {
        globalMessageHandler(message);
      }
    } catch (e) {
      console.error("❌ Error parsing websocket message:", e);
    }
  };
};

export function initSocket({ wsUrl, setSocketStatus, validatorData, onMessage }: InitializeSocket): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      // Store for reconnection
      currentWsUrl = wsUrl;
      currentSetSocketStatus = setSocketStatus;
      
      // Store the global message handler
      if (onMessage) {
        globalMessageHandler = onMessage;
      }
      
      // Save validator data if provided
      if (validatorData) {
        saveValidatorData(validatorData);
      }

      // Close existing connection if any
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }

      setSocketStatus({ connected: false, connecting: true, error: null });
      console.log('🌐 Connecting to WebSocket:', wsUrl);
      
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setSocketStatus({ connected: true, connecting: false, error: null });
        
        // Clear any pending reconnection
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        
        // Auto-register if we have saved validator data
        const savedData = loadValidatorData();
        if (savedData) {
          console.log('🔄 Auto-registering with saved validator data...');
          const registrationMessage = {
            register_validator: {
              validator_id: savedData.validatorId,
              location: {
                latitude: savedData.latitude,
                longitude: savedData.longitude
              }
            }
          };
          
          setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(registrationMessage));
              console.log('✅ Auto-registration message sent');
            }
          }, 500);
        }
        
        resolve(socket!);
      };

      socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setSocketStatus({
          connected: false,
          connecting: false,
          error: 'Failed to connect to validator network'
        });
        reject(new Error('WebSocket connection failed'));
      };

      socket.onclose = (event) => {
        console.log("❌ WebSocket disconnected", event.code, event.reason);
        setSocketStatus({ connected: false, connecting: false, error: null });
        
        // Only auto-reconnect if it wasn't a manual close (code 1000)
        // and if we have validator data (meaning user was registered)
        if (shouldReconnect && event.code !== 1000 && loadValidatorData()) {
          console.log("🔄 Connection lost, attempting to reconnect in 3 seconds...");
          reconnectTimeout = setTimeout(() => {
            attemptReconnection();
          }, 3000);
        }
      };

      // Set up the message listener immediately
      setupSocketMessageListener(socket);

    } catch (error) {
      console.error('❌ Error establishing WebSocket connection:', error);
      setSocketStatus({
        connected: false,
        connecting: false,
        error: 'Failed to establish connection'
      });
      reject(error);
    }
  });
}

// Internal function to handle reconnection
const attemptReconnection = () => {
  if (!currentWsUrl || !currentSetSocketStatus) return;
  
  console.log("🔄 Attempting to reconnect...");
  initSocket({ 
    wsUrl: currentWsUrl, 
    setSocketStatus: currentSetSocketStatus 
  }).catch((err) => {
    console.error("❌ Reconnection failed:", err);
    // Try again in 5 seconds
    reconnectTimeout = setTimeout(attemptReconnection, 5000);
  });
};

export function sendMessage({ socket, message, setSocketStatus }: WebSocketMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    const messageString = JSON.stringify(message);
    
    if (!socket) {
      console.warn("socket is null");
      return reject(new Error('socket is null'));
    }

    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageString);
        console.log('✅ Message sent successfully');
        resolve();
      } catch (err) {
        console.error('❌ Error sending message:', err);
        reject(err);
      }
    } else if (socket.readyState === WebSocket.CONNECTING) {
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
    } else {
      console.warn("⚠️ Socket not in a valid state:", socket.readyState);
      reject(new Error("Socket is not open or connecting"));
    }
  });
}

// Set or update the global message handler
export function setMessageHandler(handler: (message: any) => void): void {
  globalMessageHandler = handler;
  console.log('📡 Message handler updated');
}

// Only call this when user manually disconnects (like logout)
export function closeSocket(): void {
  shouldReconnect = false;
  clearValidatorData(); // Clear saved data
  globalMessageHandler = null; // Clear message handler
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (socket) {
    socket.close(1000, 'Manual disconnect');
    socket = null;
  }
}

// Check if there's a saved connection that should be restored
export function checkForExistingConnection(): boolean {
  return loadValidatorData() !== null;
}

// Restore connection on page load if validator was previously registered
export function restoreConnectionIfExists(wsUrl: string, setSocketStatus: any, onMessage?: (message: any) => void): Promise<WebSocket | null> {
  const savedData = loadValidatorData();
  if (savedData) {
    console.log('🔄 Restoring previous validator connection...');
    return initSocket({ wsUrl, setSocketStatus, onMessage });
  }
  return Promise.resolve(null);
}

export function isSocketConnected(): boolean {
  return socket?.readyState === WebSocket.OPEN;
}

export function getSocket(): WebSocket | null {
  return socket;
}