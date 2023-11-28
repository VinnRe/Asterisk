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

  useEffect(() => {

    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    const storedNameExtension = localStorage.getItem('nameExtension');

    console.log(storedFirstName, storedLastName, storedNameExtension)
    if (storedFirstName && storedLastName || storedNameExtension) {
      setUserName(`${storedFirstName}, ${storedLastName} ${storedNameExtension}`);
    }
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
          <Route path='/home' element={<HomePage userName={userName} />} />
          <Route path='/room/:roomName' element={<MeetingPage userName={userName} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
