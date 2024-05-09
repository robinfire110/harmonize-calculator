import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { saveSpreadsheetAll } from '../../Utils';
import moment from 'moment';
import ConfirmationModal from './ConfirmationModal';
import ProfileEventCard from '../../components/ProfileEventCard';

function Listings({ userData, gigs, onGigsChange, onDeleteEvent, onUnlistEvent, handleShowDeleteModal, handleShowUnlistModal, handleCloseDeleteModal, handleCloseUnlistModal }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showUnlistModal, setShowUnlistModal] = useState(false);
    const [eventToUnlist, setEventToUnlist] = useState(null);
    const navigate = useNavigate();

    const handleSeeMoreClick = (gig) => {
        navigate(`/event/${gig.event_id}`);
    }

    const handleCreateNewListing = () => {
        navigate('/form');
    };

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Your Listings</h2>
                <div>
                    <Button className="btn btn-dark" variant="primary" onClick={handleCreateNewListing}>Create New Listing</Button>
                </div>
            </div>
            <Tabs defaultActiveKey="events" id="listings-tabs">
                <Tab eventKey="events" title="Events">
                    <h2 className="current-listings-header">Your Upcoming Events</h2>
                    <Row>
                        {gigs
                            .filter(gig => gig.is_listed && gig.status === 'owner')
                            .map((gig) => (
                                <Col lg={4} md={6} sm={12}><ProfileEventCard gig={gig} handleShowDeleteModal={handleShowDeleteModal} handleShowUnlistModal={handleShowUnlistModal}/></Col>
                            ))}
                        {gigs.filter(gig => gig.is_listed && gig.status === 'owner').length === 0 && (
                            <div className="no-gigs-message">
                                <Button className="btn btn-dark" variant="primary" style={{ marginTop: '20px' }} onClick={() => navigate('/form')}>Create New Listing</Button>
                            </div>
                        )}
                        
                    </Row>
                </Tab>
                <Tab eventKey="pending" title="Pending">
                    <h2 className="current-listings-header">Your Pending Events</h2>
                    <Row>
                        {gigs
                            .filter(gig => gig.status === 'owner' && gig.is_listed &&
                                (!gig.Applicants || !gig.Applicants.some(applicant => applicant.status === 'accept')))

                            .map((gig) => (
                                <Col lg={4} md={6} sm={12}><ProfileEventCard gig={gig} handleShowDeleteModal={handleShowDeleteModal} handleShowUnlistModal={handleShowUnlistModal}/></Col>
                            ))}
                        {gigs.filter(gig => gig.status === 'owner' && gig.is_listed &&
                            (!gig.Applicants || !gig.Applicants.some(applicant => applicant.status === 'accept'))).length === 0 && (
                                <div className="no-gigs-message">
                                    <p>Nothing to show.</p>
                                </div>
                            )}
                    </Row>
                </Tab>
                <Tab eventKey="closed" title="Closed">
                    <h2 className="current-listings-header">Closed Listings</h2>
                    <Row>
                        {gigs
                            .filter(gig => gig.status === 'owner' && !gig.is_listed)
                            .map((gig) => (
                                <Col lg={4} md={6} sm={12}><ProfileEventCard gig={gig} editEnabled={false} unlistEnabled={false} showApplicationStatus={false} handleShowDeleteModal={handleShowDeleteModal} handleShowUnlistModal={handleShowUnlistModal}/></Col>
                            ))}
                        {gigs.filter(gig => gig.status === 'owner' && !gig.is_listed).length === 0 && (
                            <div className="no-gigs-message">
                                <p>Nothing to show.</p>
                            </div>
                        )}
                    </Row>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Listings;