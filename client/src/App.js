import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"
import Account from "./pages/Account";
import Calculator from "./pages/Calculator";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from './pages/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { clientId } from './Utils';

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Calculator/>}/>
            <Route path="/account/" element={<Account/>}/>
            <Route path="/calculator/:id?" element={<Calculator/>}/>
            <Route path='*' element={<NotFound />}/>
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
