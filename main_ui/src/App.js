// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { HomePage } from './Components/home_page/home';
import { MeetingPage } from './Components/meeting_page/MeetingPage';

function App() {
  return (
    // <div className="App">
    //   <HomePage/>
    // </div>
    <Router>
      <Routes> 
        <Route path='/' element={<HomePage />} />
        {/* <Route path='/join' element={<JoinPage />} /> */}
        <Route path='/create' element={<MeetingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
