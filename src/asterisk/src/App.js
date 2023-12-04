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
  const [roomNumber, setRoomNumber] = useState("");
  const [camStatus, setCamStatus] = useState(true);
  const [micStatus, setMicStatus] = useState(true);

  const handleVolumeChange = (newVolume) => {
    setAudioVolume(newVolume);
    localStorage.setItem('audioVolume', newVolume);
  };

  console.log("rerendered")
  const storedCamStatus = localStorage.getItem('camStatus');
  const storedMicStatus = localStorage.getItem('micStatus');
  let boolStoredCamStatus;
  let boolStoredMicStatus;


  if (storedCamStatus !== null) {
    console.log(storedCamStatus)
    if (storedCamStatus === "true") {
      boolStoredCamStatus = true;
    } else {
      boolStoredCamStatus = false;
    }
    // setCamStatus(storedCamStatus === 'true');
  }
  
  if (storedMicStatus !== null) {
    console.log(storedMicStatus)
    if (storedMicStatus === "true") {
      boolStoredMicStatus = true;
    } else {
      boolStoredMicStatus = false;
    }
    // setMicStatus(storedMicStatus === 'true');
  }

  console.log(boolStoredCamStatus)
  console.log(boolStoredMicStatus)

  useEffect(() => {

    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    const storedNameExtension = localStorage.getItem('nameExtension');
    const storedAudioVolume = localStorage.getItem('audioVolume');
    const storedRoomNumber = localStorage.getItem('roomNumber')

    console.log(storedFirstName, storedLastName, storedNameExtension)
    if (storedFirstName && storedLastName || storedNameExtension) {
      setUserName(`${storedFirstName} ${storedLastName} ${storedNameExtension}`);
    }

    setAudioVolume(storedAudioVolume ? Number(storedAudioVolume) : 50);
    setRoomNumber(storedRoomNumber);

    if (storedCamStatus !== null) {
      console.log(storedCamStatus)
      setCamStatus(storedCamStatus === 'true');
    }
    
    if (storedMicStatus !== null) {
      setMicStatus(storedMicStatus === 'true');
    }

  }, [])


  return (
    <Router>
      <Routes>
        <Route path='/login-signup' element={<LoginSignup setUserName={setUserName} />} />

        {/* Protected Routes */}
          <Route index element={<Navigate to="/home" />} />
          <Route path='/home' element={<HomePage userName={userName} audioVolume={audioVolume} setAudioVolume={handleVolumeChange} roomNumber={roomNumber} setRoomNumber={setRoomNumber} camStatus={camStatus} setCamStatus={setCamStatus} micStatus={micStatus} setMicStatus={setMicStatus} />} />
          <Route path='/room/:roomName' element={<MeetingPage userName={userName} audioVolume={audioVolume} setAudioVolume={handleVolumeChange} roomNumber={roomNumber} setRoomNumber={setRoomNumber} homeCamStatus={boolStoredCamStatus} homeMicStatus={boolStoredMicStatus} />} />
      </Routes>
    </Router>
  );
}

export default App;