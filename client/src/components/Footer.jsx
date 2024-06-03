import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Nav, NavItem, Navbar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AboutModal from './AboutModal';

function Footer() {
    //State
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    //Effect
    useEffect(() => {
        //Check for new user
        if (sessionStorage.getItem("isNewUser") === "true")
        {
            setAboutModalOpen(true);
            setIsNewUser(true);
            sessionStorage.removeItem("isNewUser");
        }
    }, [])

    return (
        <>
            <div bg="dark" style={{backgroundColor: "#e3e3e3", marginTop: "2rem", padding: "1rem"}}>
                <Nav className='m-3 justify-content-center'>
                    <NavItem><a href="/" className="mx-2 px-2 text-body-secondary">Home</a></NavItem>
                    <NavItem><Link className="mx-2 px-2 text-body-secondary" onClick={() => setAboutModalOpen(true)} to={window.location}>About</Link></NavItem>
                    <NavItem><a href="https://github.com/robinfire110/harmonize-calculator/issues" className="mx-2 px-2 text-body-secondary">GitHub</a></NavItem>
                </Nav>
                <p className="text-center text-body-secondary">Harmonize Calculator</p>
            </div>

            {/* Home page stuff */}
            <AboutModal aboutModalOpen={aboutModalOpen} setAboutModalOpen={setAboutModalOpen} isNewUser={isNewUser} />
        </>
    )
}

export default Footer;