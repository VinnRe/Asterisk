// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { HomePage } from './Components/Pages/home_page/home';
import { MeetingPage } from './Components/Pages/meeting_page/MeetingPage';
import { LoginSignup } from './Components/Pages/loginsignup_page/LoginSignup';
import { AuthRoute } from './scripts/AuthRoute';
import { useState, useEffect } from 'react';

function App() {
  const [userName, setUserName] = useState("");
  const [audioVolume, setAudioVolume] = useState(50);
  //const [roomNumber, setRoomNumber] = useState("");

  const handleVolumeChange = (newVolume) => {
    setAudioVolume(newVolume);
    localStorage.setItem('audioVolume', newVolume);
  };

  useEffect(() => {

    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    const storedNameExtension = localStorage.getItem('nameExtension');
    const storedAudioVolume = localStorage.getItem('audioVolume');
    //const storedRoomNumber = localStorage.getItem('roomNumber');

    console.log(storedFirstName, storedLastName, storedNameExtension)
    if (storedFirstName && storedLastName || storedNameExtension) {
      setUserName(`${storedFirstName} ${storedLastName} ${storedNameExtension}`);
    }

    setAudioVolume(storedAudioVolume ? Number(storedAudioVolume) : 50);
  }, [])

  return (
    <Router>
      <Routes>
        <Route path='/login-signup' element={<LoginSignup setUserName={setUserName} />} />

        {/* Protected Routes */}
        <Route
          path='/'
          element={<AuthRoute />}
        >
          <Route index element={<Navigate to="/home" />} />
          <Route path='/home' element={<HomePage userName={userName} audioVolume={audioVolume} setAudioVolume={handleVolumeChange} />} />
          <Route path='/room/:roomName' element={<MeetingPage userName={userName} audioVolume={audioVolume} setAudioVolume={handleVolumeChange} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
