import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterComponent from './routes/Register';
import LoginComponent from './routes/Login';
import DashboarComponent from './routes/Dashboard';


function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" Component={RegisterComponent} />
          <Route path="/register" Component={RegisterComponent} />
          <Route path="/login" Component={LoginComponent} />
          <Route path="/dashboard" Component={DashboarComponent} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;