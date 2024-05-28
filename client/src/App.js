import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login";
import Register from "./pages/Register"
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Calculator from "./pages/Calculator";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from './pages/NotFound';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Calculator/>}/>
          <Route exact path="/login" element={<Login/>}/>
          <Route exact path="/register" element={<Register/>}/>
          <Route path="/account/" element={<Account/>}/>
          <Route path="/profile/:id" element={<Profile/>}/>
          <Route path="/calculator/:id?" element={<Calculator/>}/>
          <Route path='*' element={<NotFound />}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
