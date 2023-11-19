// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { HomePage } from './Components/home_page/home';
import { MeetingPage } from './Components/meeting_page/MeetingPage';

function App() {
  return (
    <Router>
      <Routes> 
        <Route path='/' element={<HomePage />} />
        {/* <Route path='/create' element={<HomePage />} /> */}
        // <Route path='/create/:room' element={<MeetingPage />} />
        <Route path='/room/:roomNamme' element={<MeetingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
