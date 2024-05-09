import React from 'react'
import { Button, Card, Col, Container, Form, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function ProfileEventCard({ gig, handleShowDeleteModal, handleShowUnlistModal, handleWithdrawEvent, editEnabled=true, deleteEnabled=true, unlistEnabled=true, withdrawEnabled=false, showApplicationStatus=true}) {
    //States
    const navigate = useNavigate();
    const isButtonEnabled = editEnabled || deleteEnabled || unlistEnabled || withdrawEnabled;

    const handleSeeMoreClick = (gig) => {
        navigate(`/event/${gig.event_id}`);
    }

    return (
        <Card className="m-1" style={{ minHeight: "225px"}} key={gig.event_id} >
            <Link style={{ textDecoration: "none", color: "black" }} to={`/event/${gig.event_id}`}>
                <Card.Title>
                    <h5 className="card-title">{gig.event_name}</h5>
                    <p className="card-text">Event Date: {gig.start_time}</p>
                </Card.Title>
                <Card.Body style={{minHeight: "120px"}}>
                    {gig.addresses && gig.addresses.length > 0 && (
                        <>
                            {gig.addresses.map((address, index) => (
                                <div key={index}>
                                    <p className="card-text">Address: {address.street}, {address.city}, {address.state}, {address.zip}</p>
                                </div>
                            ))}
                        </>
                    )}
                    <p className="card-text">
                        <a href="#" onClick={() => handleSeeMoreClick(gig)}>Click for more details</a>
                    </p>
                    <p>
                        {showApplicationStatus && gig.status == "owner" && (gig.Applicants.length > 0 ? (
                            gig.Applicants.some(applicant => applicant.status === 'applied') ? (
                                'Status: See Pending'
                            ) : (
                                gig.Applicants.some(applicant => applicant.status === 'accept') ? (
                                    'Status: Applicant Hired'
                                ) : (
                                    'Status: Applicant Required'
                                )
                            )
                        ) : (
                            'Status: Applicant Required'
                        ))}

                        {gig.status === "accept" && <p className="card-text">Status: {gig.status === 'accept' ? 'You have been hired for this gig!' : gig.status}</p>}
                        {gig.status === "applied" && <p>{gig.status === 'owner' ? 'Your Listing' : gig.status === 'applied' ? 'Pending Approval' : `Status: ${gig.status}`}</p>}
                        {gig.status === "reject" && <p className="card-text">Status: Not accepted</p>}
                        {gig.status === "withdraw" && <p className="card-text">Status: You withdrew</p>}
                    </p>
                </Card.Body>
            </Link>
            {isButtonEnabled &&
            <Card.Footer>
                {withdrawEnabled && 
                    <Button
                    variant="outline-danger"
                    className="withdraw-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleWithdrawEvent(gig);
                    }}
                >
                    Withdraw
                </Button>}

                {editEnabled &&
                <Button variant="outline-secondary" className="edit-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/form/${gig.event_id}`);
                    }}
                >Edit</Button>}
                    
                {gig.status === 'owner' && (
                    <>
                        {unlistEnabled &&
                        <Button variant="outline-danger" className="unlist-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowUnlistModal(gig);
                            }}
                        > Unlist</Button>}
                           
                        {deleteEnabled && 
                        <Button variant="danger" className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowDeleteModal(gig);
                            }}
                        > Delete</Button>}
                    </>
                )}
            </Card.Footer>}
        </Card>
    )
}

export default ProfileEventCard