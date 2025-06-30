import { io, Socket } from 'socket.io-client';

// Socket.IO client for real-time communication with the AI agent
class SocketIOClient {
  private socket: Socket | null = null;
  private messageListeners: ((message: string) => void)[] = [];
  private connectedListeners: ((status: boolean) => void)[] = [];
  private typingListeners: ((isTyping: boolean) => void)[] = [];
  private sessionId: string | null = null;

  // Initialize the Socket.IO connection
  connect(serverUrl?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (this.socket) {
          this.socket.disconnect();
        }

        // Use environment variable or fallback to provided serverUrl or default
        const socketServerUrl = process.env.EXPO_PUBLIC_SOCKET_IO_SERVER_URL || serverUrl || 'http://localhost:5000';
        
        console.log('Connecting to Socket.IO server:', socketServerUrl);
        this.socket = io(socketServerUrl, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000, // Add connection timeout
        });

        this.socket.on('connect', () => {
          console.log('Socket.IO connected with ID:', this.socket?.id);
          this.sessionId = this.socket?.id || null;
          this.notifyConnectedListeners(true);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          console.error('Make sure your Socket.IO server is running at:', socketServerUrl);
          console.error('For local development, use your machine\'s IP address instead of localhost');
          this.notifyConnectedListeners(false);
          resolve(false);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          this.notifyConnectedListeners(false);
        });

        this.socket.on('agent_response', (data) => {
          console.log('Received agent response:', data);
          if (data.message) {
            this.notifyMessageListeners(data.message);
          }
          this.notifyTypingListeners(false);
        });

        this.socket.on('agent_typing', () => {
          this.notifyTypingListeners(true);
        });

        this.socket.on('connected', (data) => {
          console.log('Server connection message:', data);
        });

        this.socket.on('session_ended', (data) => {
          console.log('Session ended:', data);
        });

        // Set a timeout for the connection attempt
        setTimeout(() => {
          if (!this.socket?.connected) {
            console.error('Socket.IO connection timeout');
            this.notifyConnectedListeners(false);
            resolve(false);
          }
        }, 10000);

      } catch (error) {
        console.error('Error initializing Socket.IO:', error);
        this.notifyConnectedListeners(false);
        resolve(false);
      }
    });
  }

  // Send a message to the AI agent
  sendMessage(message: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected. Cannot send message.');
      return;
    }

    console.log('Sending message to agent:', message);
    this.socket.emit('user_message', { message });
  }

  // End the current session
  endSession(): void {
    if (!this.socket) return;
    
    console.log('Ending session');
    this.socket.emit('end_session');
    this.socket.disconnect();
    this.socket = null;
    this.sessionId = null;
  }

  // Check if the socket is connected
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Get the current session ID
  getSessionId(): string | null {
    return this.sessionId;
  }

  // Add a listener for incoming messages
  addMessageListener(listener: (message: string) => void): void {
    this.messageListeners.push(listener);
  }

  // Remove a message listener
  removeMessageListener(listener: (message: string) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  // Add a listener for connection status changes
  addConnectedListener(listener: (status: boolean) => void): void {
    this.connectedListeners.push(listener);
  }

  // Remove a connection status listener
  removeConnectedListener(listener: (status: boolean) => void): void {
    this.connectedListeners = this.connectedListeners.filter(l => l !== listener);
  }

  // Add a listener for typing indicators
  addTypingListener(listener: (isTyping: boolean) => void): void {
    this.typingListeners.push(listener);
  }

  // Remove a typing indicator listener
  removeTypingListener(listener: (isTyping: boolean) => void): void {
    this.typingListeners = this.typingListeners.filter(l => l !== listener);
  }

  // Notify all message listeners
  private notifyMessageListeners(message: string): void {
    this.messageListeners.forEach(listener => listener(message));
  }

  // Notify all connection status listeners
  private notifyConnectedListeners(status: boolean): void {
    this.connectedListeners.forEach(listener => listener(status));
  }

  // Notify all typing indicator listeners
  private notifyTypingListeners(isTyping: boolean): void {
    this.typingListeners.forEach(listener => listener(isTyping));
  }
}

// Export a singleton instance
export const socketClient = new SocketIOClient();