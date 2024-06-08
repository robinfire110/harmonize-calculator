import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Nav, NavItem, Navbar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AboutModal from './AboutModal';
import PrivacyModal from './PrivacyModal';

function Footer() {
    //State
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
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
        else
        {
            if (sessionStorage.getItem("isNewUser") != null)
            {
                sessionStorage.removeItem("isNewUser");
            }
        }

        //Open Privacy Policy
        if (window.location.hash === "#privacy")
        {
            setPrivacyModalOpen(true);
        }

    }, [])

    return (
        <>
            <div bg="dark" style={{backgroundColor: "#e3e3e3", marginTop: "auto", padding: "1rem"}}>
                <Nav className='m-3 justify-content-center'>
                <NavItem><a href="https://github.com/robinfire110/harmonize-calculator" className="mx-2 px-2 text-body-secondary">GitHub</a></NavItem>
                    <NavItem><Link className="mx-2 px-2 text-body-secondary" onClick={() => setAboutModalOpen(true)} to={window.location}>About</Link></NavItem>
                    <NavItem><Link className="mx-2 px-2 text-body-secondary" onClick={() => setPrivacyModalOpen(true)} to={window.location}>Privacy Policy</Link></NavItem>
                </Nav>
                <p className="text-center text-body-secondary">Harmonize Calculator</p>
            </div>

            {/* Home page stuff */}
            <AboutModal modalOpen={aboutModalOpen} setModalOpen={setAboutModalOpen} isNewUser={isNewUser} />
            <PrivacyModal modalOpen={privacyModalOpen} setModalOpen={setPrivacyModalOpen} />
        </>
    )
}

export default Footer;