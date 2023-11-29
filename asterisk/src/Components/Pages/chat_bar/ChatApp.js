import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../../Styles/chat_styles.css';


const socket = io('ws://localhost:3500');

function ChatApp() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [activity, setActivity] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Listen for messages
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      // Scroll to the bottom of the chat display
      chatDisplay.scrollTop = chatDisplay.scrollHeight;
    });

    // Listen for user activity
    let activityTimer;
    socket.on('activity', (username) => {
      setActivity(`${username} is typing...`);
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        setActivity('');
      }, 2000);
    });

    // Listen for user list updates
    socket.on('userList', ({ users }) => {
      setUsers(users);
    });

    // Listen for room list updates
    socket.on('roomList', ({ rooms }) => {
      setRooms(rooms);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (name && message && room) {
      socket.emit('message', { name, text: message });
      setMessage('');
    }
  };

  const enterRoom = (e) => {
    e.preventDefault();
    if (name && room) {
      socket.emit('enterRoom', { name, room });
    }
  };

  return (
    <main>
      <form className="form-join" onSubmit={enterRoom}>
        <input
          type="text"
          id="name"
          maxLength="8"
          placeholder="Your name"
          size="5"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          id="room"
          placeholder="Chat room"
          size="5"
          required
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>

      <ul className="chat-display" id="chatDisplay">
        {messages.map((msg, index) => (
          <li key={index} className={`post ${msg.name === name ? 'post--left' : 'post--right'}`}>
            <div className={`post__header ${msg.name === name ? 'post__header--user' : 'post__header--reply'}`}>
              <span className="post__header--name">{msg.name}</span>
              <span className="post__header--time">{msg.time}</span>
            </div>
            <div className="post__text">{msg.text}</div>
          </li>
        ))}
      </ul>

      <p className="user-list">
        <em>Users in {room}:</em> {users.map((user) => <span key={user.name}>{user.name}, </span>)}
      </p>
      <p className="activity">{activity}</p>

      <form className="form-msg" onSubmit={sendMessage}>
        <input
          type="text"
          id="message"
          placeholder="Your message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={() => socket.emit('activity', name)}
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default ChatApp;
