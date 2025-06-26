# React.js + WebSocket Integration Guide

## Overview

This guide shows how to integrate the WebSocket user API into a React.js application using Vite to receive real-time username submissions and user events.

## Dependencies Installation

```bash
npm install socket.io-client
# Optional: for better TypeScript support
npm install --save-dev @types/socket.io-client
```

## Project Structure

```
src/
├── hooks/
│   └── useWebSocket.ts
├── components/
│   ├── UserSubmission.tsx
│   ├── UserList.tsx
│   └── RealTimeMessages.tsx
├── services/
│   └── socketService.ts
├── types/
│   └── user.types.ts
└── App.tsx
```

## 1. Type Definitions

Create `src/types/user.types.ts`:

```typescript
export interface User {
  _id: string;
  username: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserJoinedEvent {
  username: string;
  timestamp: string;
  userId: string;
}

export interface UserLeftEvent {
  username: string;
  timestamp: string;
}

export interface UserStatusEvent {
  username: string;
  status: string;
  timestamp: string;
}

export interface ConnectedEvent {
  message: string;
  socketId: string;
  timestamp: string;
}
```

## 2. Socket Service

Create `src/services/socketService.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:4000') {
    this.serverUrl = serverUrl;
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event emitters
  emitUserLeft(username: string): void {
    this.socket?.emit('userLeft', { username });
  }

  emitUserStatusUpdate(username: string, status: string): void {
    this.socket?.emit('userStatusUpdate', { username, status });
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
```

## 3. WebSocket Hook

Create `src/hooks/useWebSocket.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import {
  UserJoinedEvent,
  UserLeftEvent,
  UserStatusEvent,
  ConnectedEvent,
} from '../types/user.types';

interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  socket: Socket | null;
  connectionError: string | null;
}

interface UseWebSocketCallbacks {
  onUserJoined?: (data: UserJoinedEvent) => void;
  onUserLeft?: (data: UserLeftEvent) => void;
  onUserStatusUpdate?: (data: UserStatusEvent) => void;
  onConnected?: (data: ConnectedEvent) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export const useWebSocket = (callbacks: UseWebSocketCallbacks = {}): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const connect = useCallback(() => {
    try {
      const socket = socketService.connect();

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected');
      });

      socket.on('disconnect', reason => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', reason);
        callbacksRef.current.onDisconnect?.();
      });

      socket.on('connect_error', error => {
        setConnectionError(error.message);
        setIsConnected(false);
        console.error('WebSocket connection error:', error);
        callbacksRef.current.onError?.(error.message);
      });

      // Custom events
      socket.on('connected', (data: ConnectedEvent) => {
        callbacksRef.current.onConnected?.(data);
      });

      socket.on('userJoined', (data: UserJoinedEvent) => {
        callbacksRef.current.onUserJoined?.(data);
      });

      socket.on('userLeft', (data: UserLeftEvent) => {
        callbacksRef.current.onUserLeft?.(data);
      });

      socket.on('userStatusUpdate', (data: UserStatusEvent) => {
        callbacksRef.current.onUserStatusUpdate?.(data);
      });
    } catch (error) {
      setConnectionError('Failed to initialize socket connection');
      console.error('Socket initialization error:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    socket: socketService.getSocket(),
    connectionError,
  };
};
```

## 4. User Submission Component

Create `src/components/UserSubmission.tsx`:

```typescript
import React, { useState } from 'react';

interface UserSubmissionProps {
  onUserSubmitted?: (username: string) => void;
  serverUrl?: string;
}

interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    userId: string;
    timestamp: string;
  };
}

export const UserSubmission: React.FC<UserSubmissionProps> = ({
  onUserSubmitted,
  serverUrl = 'http://localhost:4000',
}) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submitUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Please enter a username' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${serverUrl}/user/submit-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data: SubmissionResponse = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setUsername('');
        onUserSubmitted?.(data.data!.username);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection.',
      });
      console.error('Error submitting username:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-submission">
      <form onSubmit={submitUsername} className="submission-form">
        <div className="input-group">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isSubmitting}
            className="username-input"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Join'}
          </button>
        </div>
      </form>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}
    </div>
  );
};
```

## 5. Real-Time Messages Component

Create `src/components/RealTimeMessages.tsx`:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { UserJoinedEvent, UserLeftEvent, UserStatusEvent } from '../types/user.types';

interface Message {
  id: string;
  type: 'userJoined' | 'userLeft' | 'userStatus' | 'system';
  content: string;
  timestamp: Date;
  username?: string;
}

interface RealTimeMessagesProps {
  userJoinedEvents: UserJoinedEvent[];
  userLeftEvents: UserLeftEvent[];
  userStatusEvents: UserStatusEvent[];
  maxMessages?: number;
}

export const RealTimeMessages: React.FC<RealTimeMessagesProps> = ({
  userJoinedEvents,
  userLeftEvents,
  userStatusEvents,
  maxMessages = 50,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle user joined events
  useEffect(() => {
    if (userJoinedEvents.length > 0) {
      const latestEvent = userJoinedEvents[userJoinedEvents.length - 1];
      const newMessage: Message = {
        id: `joined-${latestEvent.userId}-${latestEvent.timestamp}`,
        type: 'userJoined',
        content: `🎉 ${latestEvent.username} joined the party!`,
        timestamp: new Date(latestEvent.timestamp),
        username: latestEvent.username,
      };

      setMessages(prev => [...prev.slice(-maxMessages + 1), newMessage]);
    }
  }, [userJoinedEvents, maxMessages]);

  // Handle user left events
  useEffect(() => {
    if (userLeftEvents.length > 0) {
      const latestEvent = userLeftEvents[userLeftEvents.length - 1];
      const newMessage: Message = {
        id: `left-${latestEvent.username}-${latestEvent.timestamp}`,
        type: 'userLeft',
        content: `👋 ${latestEvent.username} left the party`,
        timestamp: new Date(latestEvent.timestamp),
        username: latestEvent.username,
      };

      setMessages(prev => [...prev.slice(-maxMessages + 1), newMessage]);
    }
  }, [userLeftEvents, maxMessages]);

  // Handle user status events
  useEffect(() => {
    if (userStatusEvents.length > 0) {
      const latestEvent = userStatusEvents[userStatusEvents.length - 1];
      const newMessage: Message = {
        id: `status-${latestEvent.username}-${latestEvent.timestamp}`,
        type: 'userStatus',
        content: `📝 ${latestEvent.username} is now ${latestEvent.status}`,
        timestamp: new Date(latestEvent.timestamp),
        username: latestEvent.username,
      };

      setMessages(prev => [...prev.slice(-maxMessages + 1), newMessage]);
    }
  }, [userStatusEvents, maxMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'userJoined':
        return '🎉';
      case 'userLeft':
        return '👋';
      case 'userStatus':
        return '📝';
      default:
        return '💬';
    }
  };

  return (
    <div className="real-time-messages">
      <h3>Live Activity Feed</h3>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No activity yet. Submit a username to get started!</div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message message-${message.type}`}>
              <span className="message-icon">{getMessageIcon(message.type)}</span>
              <span className="message-content">{message.content}</span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
```

## 6. User List Component

Create `src/components/UserList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { User } from '../types/user.types';

interface UserListProps {
  serverUrl?: string;
  refreshTrigger?: number; // To trigger refresh from parent
}

export const UserList: React.FC<UserListProps> = ({
  serverUrl = 'http://localhost:4000',
  refreshTrigger,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/user/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [serverUrl, refreshTrigger]);

  const formatJoinTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="user-list">
        <h3>Connected Users</h3>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list">
        <h3>Connected Users</h3>
        <div className="error">
          {error}
          <button onClick={fetchUsers} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Connected Users ({users.length})</h3>
        <button onClick={fetchUsers} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="no-users">No users connected yet</div>
      ) : (
        <div className="users-container">
          {users.map(user => (
            <div key={user._id} className="user-item">
              <div className="user-info">
                <span className="username">{user.username}</span>
                <span className="join-time">Joined: {formatJoinTime(user.createdAt)}</span>
              </div>
              <div className="user-status online">●</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 7. Main App Component

Create or update `src/App.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { UserSubmission } from './components/UserSubmission';
import { UserList } from './components/UserList';
import { RealTimeMessages } from './components/RealTimeMessages';
import { UserJoinedEvent, UserLeftEvent, UserStatusEvent } from './types/user.types';
import './App.css';

const SERVER_URL = 'http://localhost:4000'; // Change this to your backend URL

function App() {
  const [userJoinedEvents, setUserJoinedEvents] = useState<UserJoinedEvent[]>([]);
  const [userLeftEvents, setUserLeftEvents] = useState<UserLeftEvent[]>([]);
  const [userStatusEvents, setUserStatusEvents] = useState<UserStatusEvent[]>([]);
  const [refreshUserList, setRefreshUserList] = useState(0);

  const handleUserJoined = useCallback((data: UserJoinedEvent) => {
    setUserJoinedEvents(prev => [...prev, data]);
    setRefreshUserList(prev => prev + 1); // Trigger user list refresh
  }, []);

  const handleUserLeft = useCallback((data: UserLeftEvent) => {
    setUserLeftEvents(prev => [...prev, data]);
    setRefreshUserList(prev => prev + 1); // Trigger user list refresh
  }, []);

  const handleUserStatusUpdate = useCallback((data: UserStatusEvent) => {
    setUserStatusEvents(prev => [...prev, data]);
  }, []);

  const handleConnected = useCallback((data: any) => {
    console.log('Connected to WebSocket:', data);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('Disconnected from WebSocket');
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('WebSocket error:', error);
  }, []);

  const { isConnected, connect, disconnect, connectionError } = useWebSocket({
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onUserStatusUpdate: handleUserStatusUpdate,
    onConnected: handleConnected,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  const handleUserSubmitted = useCallback((username: string) => {
    console.log('User submitted:', username);
    // Optionally trigger a user list refresh
    setRefreshUserList(prev => prev + 1);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time User Activity</h1>
        <div className="connection-controls">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          {!isConnected && (
            <button onClick={connect} className="connect-button">
              Connect WebSocket
            </button>
          )}
          {isConnected && (
            <button onClick={disconnect} className="disconnect-button">
              Disconnect
            </button>
          )}
        </div>
        {connectionError && (
          <div className="connection-error">⚠️ Connection Error: {connectionError}</div>
        )}
      </header>

      <main className="app-main">
        <div className="app-grid">
          <section className="user-submission-section">
            <h2>Join the Party</h2>
            <UserSubmission onUserSubmitted={handleUserSubmitted} serverUrl={SERVER_URL} />
          </section>

          <section className="user-list-section">
            <UserList serverUrl={SERVER_URL} refreshTrigger={refreshUserList} />
          </section>

          <section className="messages-section">
            <RealTimeMessages
              userJoinedEvents={userJoinedEvents}
              userLeftEvents={userLeftEvents}
              userStatusEvents={userStatusEvents}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
```

## 8. CSS Styles

Create or update `src/App.css`:

```css
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e5e9;
}

.app-header h1 {
  color: #333;
  margin-bottom: 15px;
}

.connection-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.connection-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.connection-status.connected {
  background-color: #d4edda;
  color: #155724;
}

.connection-status.disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

.connect-button,
.disconnect-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.connect-button {
  background-color: #28a745;
  color: white;
}

.connect-button:hover {
  background-color: #218838;
}

.disconnect-button {
  background-color: #dc3545;
  color: white;
}

.disconnect-button:hover {
  background-color: #c82333;
}

.connection-error {
  color: #721c24;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
}

.app-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-height: 500px;
}

.user-submission-section {
  grid-column: 1 / -1;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-list-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.messages-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* User Submission Styles */
.submission-form {
  margin-bottom: 15px;
}

.input-group {
  display: flex;
  gap: 10px;
  max-width: 400px;
}

.username-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.username-input:focus {
  outline: none;
  border-color: #007bff;
}

.username-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.submit-button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* User List Styles */
.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-list-header h3 {
  margin: 0;
  color: #333;
}

.refresh-button,
.retry-button {
  padding: 6px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.refresh-button:hover,
.retry-button:hover {
  background-color: #545b62;
}

.loading,
.error,
.no-users {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
  border-radius: 6px;
}

.users-container {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f8f9fa;
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.join-time {
  font-size: 12px;
  color: #6c757d;
}

.user-status.online {
  color: #28a745;
  font-size: 18px;
}

/* Real-Time Messages Styles */
.real-time-messages h3 {
  margin-bottom: 15px;
  color: #333;
}

.messages-container {
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px;
  background-color: #f8f9fa;
}

.no-messages {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  font-size: 14px;
}

.message-userJoined {
  border-left-color: #28a745;
}

.message-userLeft {
  border-left-color: #ffc107;
}

.message-userStatus {
  border-left-color: #17a2b8;
}

.message-icon {
  font-size: 16px;
}

.message-content {
  flex: 1;
  color: #333;
}

.message-time {
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-grid {
    grid-template-columns: 1fr;
  }

  .input-group {
    flex-direction: column;
    max-width: none;
  }

  .connection-controls {
    flex-direction: column;
    gap: 10px;
  }
}
```

## 9. Environment Configuration

Create `.env` file in your React project root:

```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=http://localhost:4000
```

Update your components to use environment variables:

```typescript
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

## 10. Usage Instructions

1. **Install dependencies** in your React project
2. **Copy the files** to their respective locations
3. **Update the SERVER_URL** in `App.tsx` to match your backend
4. **Start your React app**: `npm run dev`
5. **Start your backend server**: The one we created earlier
6. **Test the integration**:
   - Open multiple browser tabs
   - Submit usernames and watch real-time updates
   - See users appear in the user list immediately

## Key Features

✅ **Real-time username notifications** across all connected clients
✅ **User list with automatic refresh**
✅ **Connection status indicator**
✅ **Error handling and retry logic**
✅ **Responsive design**
✅ **TypeScript support**
✅ **Clean component architecture**

## Advanced Features You Can Add

- **User avatars** and profiles
- **Private messaging** between users
- **Rooms/channels** for different groups
- **Typing indicators**
- **User presence** (online/offline status)
- **Message history** persistence
- **Push notifications**

This setup provides a robust foundation for real-time user interaction in your React application!
