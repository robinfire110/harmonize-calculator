import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Nav, NavItem, Navbar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
    //State
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    //Effect
    useEffect(() => {
        //Check for new user
        console.log(sessionStorage.getItem("isNewUser"));
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
                    <NavItem><Link className="mx-2 px-2 text-body-secondary" onClick={() => setAboutModalOpen(true)}>About</Link></NavItem>
                    <NavItem><a href="https://github.com/robinfire110/harmonize-calculator/issues" className="mx-2 px-2 text-body-secondary">GitHub</a></NavItem>
                </Nav>
                <p className="text-center text-body-secondary">Harmonize Calculator</p>
            </div>

            {/* Home page stuff */}
            <Modal show={aboutModalOpen} onHide={() => {setAboutModalOpen(false);}} centered={true} size="lg">
            <Modal.Header closeButton>
                <Col>
                <Row><Modal.Title>{isNewUser ? "Welcome to Harmonize Calculator!" : "About Harmonize Calculator"}</Modal.Title></Row>
                <Row><p className='mb-0'>Harmonize Calculator was made to quickly and easily calculate your hourly wage from any given gig.</p></Row>
                </Col>
            </Modal.Header>
            <Modal.Body>
                <h5>How to use</h5>
                <p>
                    1. Start by inputting your <b>Pay per gig</b> and <b>Hours per gig</b> to get a basic hourly wage.<br />
                    2. Add more information about your gig such as travel, additional hours, tax or any other expenses.<br />
                    3. Save your results to your account or export them to a spreasheet by clicking the <b>Save</b> or <b>Export</b> buttons.<br />
                </p>
                <hr />
                <h5>Tips</h5>
                <ul>
                    <li>You can turn individual fields on/off to see how they affect your final result.</li>
                    <li>Have multiple gigs or services? Use the <b>Number of Gigs</b> option to account for several gigs and use the <b>Options</b> button to change what gets multiplied depending on your needs.</li>
                    <li>Don't know the exact distance of the gig? Click the <b>Use Location</b> button to automatically calculate your travel mileage and hours using zip codes.</li>
                    <li>Don't know your exact gas price per mile? Click the <b>Use Average</b> button to use average gas prices and vehicle MPG values.</li>
                </ul>
                <hr />
                <h5>Signing In</h5>
                <p>While the core functionally of the calculator is available to anyone, there are some benefits to signing in...</p>
                <ul>
                    <li>Saving results to your account to load at a later time.</li>
                    <li>Managing your saved calcuations and the ability to export multiple results into one spreadsheet.</li>
                    <li>Ability to set default values for the calculator.</li>
                </ul>
                <p>You can sign in using a Google Account by clicking the <b>Sign in with Google</b> button in the navigation menu. We only store your email (for authentication purposes), any default settings and saved results in our database. You can delete your account, wiping all your data from our databases, at any time within the <b>Account</b> page.</p>
                <hr />
                <h5>Credits</h5>
                <p>
                    Harmonize Calculator is a spin-off of a larger Computer Science Senior Capstone project at <a href='https://compsci.uncg.edu/' target='blank' style={{color: 'black'}}>University of North Carolina Greensboro</a>. The original team was Craig Smith, Andy Bonola and Andy Villasmil. 
                    <br />
                    The work to spin-off the project was done by Andy Villasmil.
                </p>
                <hr />
                <h5>GitHub & Issues</h5>
                <p>
                    The source code for this project is available on <a href="https://github.com/robinfire110/harmonize-calculator" target='blank' style={{color: 'black'}}>GitHub</a> if you would like to make any contributions.
                    Additionally, if you encounter and issues or have any feature requests, you can let me know by submitting an <a href="https://github.com/robinfire110/harmonize-calculator/issues" target='blank' style={{color: 'black'}}>issue on GitHub.</a>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => {setAboutModalOpen(false)}}>Close</Button>
            </Modal.Footer>
            </Modal>
        </>
    )
}

export default Footer;