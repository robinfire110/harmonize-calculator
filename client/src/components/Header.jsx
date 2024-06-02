import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Col } from 'react-bootstrap';
import LogoutButton from './LogoutButton';
import { useCookies } from 'react-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { getBackendURL } from '../Utils';
import axios from 'axios';

function Header() {
    const [cookies] = useCookies(['jwt']);
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(cookies.jwt)
    const navigate = useNavigate();

    useEffect(() => {
      setIsLoggedIn(cookies.jwt);
    }, [])

    return (
        <div>
            <ToastContainer />
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand className="ml-5" href="/">
                        <img src={require('../img/logo-2.png')} height={50} className="d-inline-block align-top"></img>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav style={{width: "100%"}}>
                            <Nav.Item><Nav.Link href='/calculator'>Calculator</Nav.Link></Nav.Item>
                        </Nav>
                        <Nav className="justify-content-end" style={{width: "100%"}}>
                            {!isLoggedIn && <Nav.Item className='m-lg-0 m-sm-auto m-auto'><GoogleLogin
                                onSuccess={credentialResponse => {
                                    axios.post(`${getBackendURL()}/login`, {"credential": credentialResponse.credential}, { withCredentials: true}).then((res) => {
                                        sessionStorage.setItem("isNewUser", res.data.isNewUser);
                                        window.location.replace("/");
                                    });
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                                /></Nav.Item>}
                            {/*!isLoggedIn && <Nav.Item><Nav.Link href="/login">Login/Register</Nav.Link></Nav.Item>*/}
                            {isLoggedIn && <Nav.Item><Nav.Link href="/account#listings">Account</Nav.Link></Nav.Item>}
                            {isLoggedIn && <LogoutButton />}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <br />
        </div>
    );
}

export default Header;
