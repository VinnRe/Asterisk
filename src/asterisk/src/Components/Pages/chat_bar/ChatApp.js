import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../../Styles/chat_styles.css';


const socket = io('ws://localhost:3500');
console.log('Socket connected:', socket.connected);

function ChatApp({ userName, roomNumber }) {
  // const [name, setName] = useState('');
  // const [room, setRoom] = useState('');
  const name = userName;
  const room = roomNumber;
  console.log(room);
  const [message, setMessage] = useState('');
  const [activity, setActivity] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Listen for messages
    socket.on('message', (data) => {
      console.log('Message received:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
      // Scroll to the bottom of the chat display
      //chatDisplay.scrollTop = chatDisplay.scrollHeight;
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
    
    enterRoom()
    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    console.log("sendMessage called")
    if (name && message && room) {
      console.log("MESSAGE SENT")
      socket.emit('message', { name, text: message });
      setMessage('');
    }
  };

  const enterRoom = (e) => {
    // e.preventDefault();
    // console.log("ROOM ENTERED")
    if (name && room) {
      socket.emit('enterRoom', { name, room });
    }
  };

  const renderMessages = () => {
    return messages
      .filter((msg) => msg.name !== 'Admin') // Exclude admin messages
      .map((msg, index) => (
        <li key={index} className={`post ${msg.name === name ? 'post--left' : 'post--right'}`}>
          <div className={`post__header ${msg.name === name ? 'post__header--user' : 'post__header--reply'}`}>
            <span className="post__header--name">{msg.name}</span>
            <span className="post__header--time">{msg.time}</span>
          </div>
          <div className="post__text">{msg.text}</div>
        </li>
      ));
  };
  const renderAdminMessages = () => {
    return messages
      .filter((msg) => msg.name === 'Admin')
      .map((adminMsg, index) => (
        <li key={index} className="admin-message">
          {adminMsg.text}
        </li>
      ));
  };

  return (
    <div className='chat--system'>
      <main className="main-chat">
        <body className='body-chat'>
          <ul className="chat-display" id="chatDisplay">
            {renderAdminMessages()}
            {renderMessages()}
          </ul>

          <p className="activity">{activity}</p>

          <form className="form-msg" onSubmit={sendMessage}>
            <input
              type="text"
              id="message"
              className='input-chat'
              placeholder="Your message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={() => socket.emit('activity', name)}
              autoComplete="off"
            />
            
            <button type="submit" className='button-chat'>
              <span class="material-icons | send-message__button ">send</span>
            </button>
          </form>
        </body>
      </main>
    </div>
  );
}

export default ChatApp;
