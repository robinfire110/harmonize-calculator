import React from 'react'
import { Accordion, Button, Col, Modal, Row } from 'react-bootstrap';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

function AboutModal({modalOpen, setModalOpen, isNewUser=false}) {
    return (
    <Modal show={modalOpen} onHide={() => {setModalOpen(false);}} centered={true} size="lg">
        <Modal.Header closeButton>
            <Col>
            <Row><Modal.Title>{isNewUser ? "Welcome to Harmonize Calculator!" : "About Harmonize Calculator"}</Modal.Title></Row>
            </Col>
        </Modal.Header>
        <Modal.Body>
            <Accordion defaultActiveKey={isNewUser ? "0" : ""} flush>
                <Accordion.Item eventKey='0' >
                    <Accordion.Header><h4>Overview</h4></Accordion.Header>
                        <Accordion.Body style={{textAlign: "center"}}>
                            <p style={{textAlign: "left"}}>Harmonize Calculator was made as a quick and easy way to calculate, save and manage gig financials. Watch this video for a brief overview of the site and all it's features! Alternatively, see below for a more information about how to use the site, various tips, credits and more!</p>
                            <LiteYouTubeEmbed id='-bGkDlbghNQ' title='Harmonize Calculator Overview' adNetwork={false} noCookie={true}/>
                        </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='1'>
                    <Accordion.Header><h4>How to use</h4></Accordion.Header>
                    <Accordion.Body>
                        <ol>
                            <li>Start by inputting your <b>Pay per gig</b> and <b>Hours per gig</b> to get a basic hourly wage.</li>
                            <li>Add more information about your gig such as travel, additional hours, tax or any other expenses.</li>
                            <li>Save your results to your account or export them to a spreasheet by clicking the <b>Save</b> or <b>Export</b> buttons.</li>
                        </ol>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='2'>
                    <Accordion.Header><h4>Tips</h4></Accordion.Header>
                        <Accordion.Body>
                        <ul>
                            <li>You can turn individual fields on/off to see how they affect your final result.</li>
                            <li>Have multiple gigs or services? Use the <b>Number of Gigs</b> option to multiply your values. Use the <b>Options</b> button to change which fields get multiplied depending on your needs.</li>
                            <li>Don't know the exact distance of the gig? Click the <b>Use Location</b> button to automatically calculate your travel mileage and hours using zip codes.</li>
                            <li>Don't know your exact gas price per mile? Click the <b>Use Average</b> button to use average gas prices and vehicle MPG values.</li>
                            <li>You can install Harmonize as an app (if you prefer) by using the <i>Install App</i> button in your browser!</li>
                        </ul>
                        </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='3'>
                    <Accordion.Header><h4>Signing In</h4></Accordion.Header>
                        <Accordion.Body>
                            <p>While the core functionally of the calculator is available to anyone, there are some benefits to signing in...</p>
                            <ul>
                                <li>Saving results to your account to view and update at a later time.</li>
                                <li>Managing your saved calcuations and the ability to export multiple results into one spreadsheet.</li>
                                <li>Ability to set default values for the calculator.</li>
                            </ul>
                            <p>You can sign in using a Google Account by clicking the <b>Sign in with Google</b> button in the navigation menu. We only store your email (for authentication purposes), any default settings and saved results in our database. You can delete your account, wiping all your data from our databases, at any time within the <b>Account</b> page.</p>
                        </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='4'>
                    <Accordion.Header><h4>Credits</h4></Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <Col sm={4}>
                                <u>Original Harmonize Team</u> <br />
                                Craig Smith<br />
                                Andy Bonola<br />
                                Andy Villasmil
                                <br /> <br />
                                <u>Harmonize Calculator</u><br />
                                Andy Villasmil
                                <br /> <br />
                                </Col>
                                <Col>
                                Harmonize Calculator is a spin-off of the larger <a href="https://github.com/robinfire110/music-gig-app" target='blank' style={{color: "black"}}>Harmonize</a> project for a Computer Science Senior Capstone Project. It takes all the gig calculation features from that project and expands on them to create a standalone, fully featured calculator site.
                                </Col>
                            </Row>
                        </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='5'>
                    <Accordion.Header><h4>GitHub, Feature Requests & Issues</h4></Accordion.Header>
                        <Accordion.Body>
                            <p>
                                The source code for this project is available on <a href="https://github.com/robinfire110/harmonize-calculator" target='blank' style={{color: 'black'}}>GitHub</a> if you would like to make any contributions.
                                Additionally, if you encounter any issues or have a feature request, you can let me know by submitting an <a href="https://github.com/robinfire110/harmonize-calculator/issues" target='blank' style={{color: 'black'}}>issue on GitHub.</a>
                            </p>
                        </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Modal.Body>
        <Modal.Footer>
            <small className='me-auto text-muted'>Version 1.0.1</small>
            <Button variant="primary" onClick={() => {setModalOpen(false)}}>Close</Button>
        </Modal.Footer>
    </Modal>
    )
}

export default AboutModal