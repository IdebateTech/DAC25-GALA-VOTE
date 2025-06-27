import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      
      // Join admin room if user is admin
      const token = localStorage.getItem('dreamers-auth-token');
      const userData = localStorage.getItem('dreamers-user-data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'admin') {
            this.socket?.emit('join-admin', token);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Category events
    this.socket.on('category-created', (data) => {
      this.emit('category-created', data);
    });

    this.socket.on('category-updated', (data) => {
      this.emit('category-updated', data);
    });

    this.socket.on('category-deleted', (data) => {
      this.emit('category-deleted', data);
    });

    // Nominee events
    this.socket.on('nominee-added', (data) => {
      this.emit('nominee-added', data);
    });

    this.socket.on('nominee-updated', (data) => {
      this.emit('nominee-updated', data);
    });

    this.socket.on('nominee-deleted', (data) => {
      this.emit('nominee-deleted', data);
    });

    this.socket.on('nominee-photo-updated', (data) => {
      this.emit('nominee-photo-updated', data);
    });

    this.socket.on('nominee-photo-deleted', (data) => {
      this.emit('nominee-photo-deleted', data);
    });

    // Vote events
    this.socket.on('vote-cast', (data) => {
      this.emit('vote-cast', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;