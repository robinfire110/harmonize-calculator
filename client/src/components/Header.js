import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Col } from 'react-bootstrap';
import LogoutButton from '../auth/LogoutButton';
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

function Header() {
    const [cookies] = useCookies(['jwt']);
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(cookies.jwt)

    useEffect(() => {
      setIsLoggedIn(cookies.jwt);
    }, [cookies])

    return (
        <div>
            <ToastContainer />
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="/">
                        <img src={require('../img/logo-2.png')} height={50} className="d-inline-block align-top"></img>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="justify-content-end">
                            {isLoggedIn && <Nav.Item><Nav.Link href="/form">List Event</Nav.Link></Nav.Item>}
                            <Nav.Item><Nav.Link href="/eventsearch">Events</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="/calculator">Calculator</Nav.Link></Nav.Item>
                            {!isLoggedIn && <Nav.Item><Nav.Link href="/login">Login/Register</Nav.Link></Nav.Item>}
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
