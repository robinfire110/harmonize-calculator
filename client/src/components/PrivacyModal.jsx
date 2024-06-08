import React from 'react'
import { Accordion, Button, Col, Modal, Row } from 'react-bootstrap';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

function PrivacyModal({modalOpen, setModalOpen}) {
    return (
    <Modal show={modalOpen} onHide={() => {setModalOpen(false);}} centered={true} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            If you're not signed in, Harmonize Calculator does not store or track any user data. If you sign-in using Google, Harmonize Calculator will store your email for authentication purposes. No other data from your Google account is stored (such as name, location or password). All other user data (saved calculations and default settings) will be stored in our database and will not be shared with any third party. General, non-user specific aggregate data may be looked over for statistical purposes (i.e. total number of registered users or saved calculations) to monitor the usage of the application.
            <br /> <br />
            If you wish to delete your account and all associated data, you can do so at any time in the Account page. If you lose access to your Google account and wish for your data to be deleted, please let the developer know (by contacting them or submitting an issue) and they will assist you.
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => {setModalOpen(false)}}>Close</Button>
        </Modal.Footer>
    </Modal>
    )
}

export default PrivacyModal