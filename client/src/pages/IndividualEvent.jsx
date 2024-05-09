import React from "react";
import moment from 'moment';
import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Col, Row, Button, Card, Modal, Form, InputGroup} from "react-bootstrap"; // Bootstrap imports
import { useCookies } from "react-cookie";
import { ClipLoader, BarLoader } from "react-spinners";
import "../styles/IndividualEvent.css";
import {createToast, formatCurrency, getEventOwner, sendEmail, toastError, toastInfo, toastSuccess } from "../Utils";
import {getBackendURL} from "../Utils";
import { toast } from "react-toastify";
import TooltipButton from "../components/TooltipButton";
import Title from "../components/Title";

const IndividualEvent = () => {
    const [event, setEvent] = useState();
    const [cookies, removeCookie] = useCookies([]);
    const [currentUser, setCurrentUser] = useState() //Current user's id set here
    const [owner, setOwner] = useState() //get the owner's id here
    const [applications, setApplications] = useState([]);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [applyModalData, setApplyModalData] = useState({email: "", message: ""});
    const [isLoadingApplication, setIsLoadingApplication] = useState(false); 
    const [withdrawn, setWithdrawn] = useState([])
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [accepted, setAccepted] = useState([]);
    const [rejected, setRejected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [colSize, setColSize] = useState({xs: 5, sm: 5, md: 5, lg: 5, xl: 4})
    const [id, setId] = useState(useParams().id);
    const navigate = useNavigate();

    //Get logged in user data
    useEffect(() => {
        if (cookies.jwt) {
            try {
                //Get User
                axios.get(`${getBackendURL()}/account`, { withCredentials: true }).then(res => {
                    const userData = res.data?.user;
                    if (userData) {
                        setCurrentUser(userData);
                        setApplyModalData({...applyModalData, email: userData.email})
                    }
                });
            }catch (err) {
                console.log(err)
            }
        }
        else setCurrentUser(null);
    }, [])

    //Get event (after you get logged in data)
    useEffect(() => {
        if (currentUser !== undefined)
        {
            try {
                //Get event
                getEventData();
            
            } catch (error) {
                console.log(error)
            }
        }
    }, [currentUser]);

    const getEventData = () => {
        axios.get(`${getBackendURL()}/event/id/${id}`, { withCredentials: true }).then((res) => {
            const data = res.data;
            const eventOwner = getEventOwner(data);
            console.log(data);
            if (id != "" && data && (data.is_listed || (currentUser?.user_id == eventOwner?.user_id)))
            {
                setEvent(data)
                setOwner(eventOwner);

                const appliedUsers = data.Users.filter(user => user.UserStatus.status === 'applied');
                const withdrawnUsers = data.Users.filter(user => user.UserStatus.status === 'withdraw');
                const acceptedUsers = data.Users.filter(user => user.UserStatus.status === 'accept');
                const rejectedUsers = data.Users.filter(user => user.UserStatus.status === 'reject');
                setApplications(appliedUsers);
                setWithdrawn(withdrawnUsers);
                setAccepted(acceptedUsers);
                setRejected(rejectedUsers);

                setLoading(false);
            }
            else
            {
                navigate("/eventsearch");
                toast("This event does not exists", toastError);
            }
        });
    }

    const isEventOwner = () => {
        if (owner && currentUser) return owner?.user_id === currentUser?.user_id
        return false;
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${getBackendURL()}/event/${id}`);
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    }

    const formatDate = (dateString) => {
        return moment(dateString).format("dddd, MMMM D")
    }

    const formatTime = (timeString) => {
        return moment(timeString).format("h:mm A");
    }

    const handleAddApplication = async (user, email=false) => {
        const isMessage = applyModalData.message.length > 0;
        if (!isLoadingApplication)
        {
            //Validate data
            if (document.getElementById("applyModalForm"))
            {
                const inputs = document.getElementById("applyModalForm").elements;
                for (let i = 0; i < inputs.length; i++) {
                    if (!inputs[i].disabled && (!inputs[i].checkValidity() || (/([<>\\;|~])/g.test(inputs[i].value))))
                    {
                        inputs[i].reportValidity();
                        if (inputs[i].type === "textarea") inputs[i].setCustomValidity("Message cannot include special characters (<>\\;|~).");
                        console.log("NOT VALID");
                        return false
                    } 
                }
            }
            setIsLoadingApplication(true);

            //Apply            
            try {
                const applicationData = { status: 'applied' }
                const applicantEmail = {
                    to: currentUser.email,
                    subject: `Application Submitted to ${event.event_name}`,
                    html:
                    `<h2>Application Submission Confirmation</h2>
                    <p>Your application to <a href="https://harmonize.rocks/event/${event.event_id}">${event.event_name}</a> has been submitted. The owner of the event will accept or reject your application.</p>
                    <p>They will likely be in touch (if you haven't already communicated) using the email address listed in your account. If this email is not correct, please update it as soon as possible.</p>
                    <p>Good luck!</p>
                    <hr>
                    <small>This is an automated email sent by <a href="https://harmonize.rocks" target="_blank">Harmonize</a>. Do not reply or send messages to this email address (harmonizeapp@outlook.com), it will not be seen.</small>
                    `
                };
                const ownerEmail = {
                    to: owner.email,
                    subject: `Application Recieved for ${event.event_name}`,
                    replyTo: applyModalData.email,
                    html:
                    `<h2>Application Recieved!</h2>
                    <p><a href="https://harmonize.rocks/profile/${user.user_id}">${user.f_name} ${user.l_name}</a> has submitted an application for your <a href="https://harmonize.rocks/event/${event.event_id}">${event.event_name}</a> event. You can review this, and all current applications, on the event page.</p>
                    <p>Below is the application information, including a contact email${isMessage ? " and a message from the user." : "."}
                    <br>
                    <p><b>Contact Email: </b>${applyModalData.email}</p>
                    ${isMessage ? `<p><b>Message:</b> ${applyModalData.message}</p>` : ""}
                    <p>We suggest you look into applicant profiles and see if they are a good fit. We also recommend reaching out to the applicant during the process using the email provided above or by replying to this email. When a decision has been made, please Accept or Reject the application.
                    <p>Happy gigging!</p>
                    <hr>
                    <small>This is an automated email sent by <a href="https://harmonize.rocks" target="_blank">Harmonize</a>. Do not reply or send messages to this email address (harmonizeapp@outlook.com), it will not be seen.</small>
                    `
                };
                //If the user isn't in the list, post
                if (user && event && !event.Users.some(listUser => listUser.user_id === user.user_id))
                {
                    const applicationData = { status: 'applied' }
                    axios.post(`${getBackendURL()}/event/users/${id}/${currentUser.user_id}`, applicationData, { withCredentials: true }).then(async res => {
                        //Send emails (doesn't have to wait because it's not crucial to the page)
                        if (email)
                        {
                            axios.post(`${getBackendURL()}/api/email`, applicantEmail, { withCredentials: true });
                            axios.post(`${getBackendURL()}/api/email`, ownerEmail, { withCredentials: true });
                        }
                        getEventData(); //Reload data
                        toast("Application Submitted", toastSuccess);
                        setIsLoadingApplication(false);
                        setWithdrawModalOpen(false); 
                        setApplyModalOpen(false);
                    })
                }
                else //If the user is in the list, put.
                {
                    axios.put(`${getBackendURL()}/event/users/${id}/${user.user_id}`, applicationData, { withCredentials: true }).then(async res => {  
                        //Send emails (doesn't have to wait because it's not crucial to the page)
                        if (email)
                        {
                            axios.post(`${getBackendURL()}/api/email`, applicantEmail, { withCredentials: true });
                            axios.post(`${getBackendURL()}/api/email`, ownerEmail, { withCredentials: true });
                        }
                        
                        getEventData(); //Reload data
                        toast("Application Submitted", toastSuccess);
                        setIsLoadingApplication(false);
                        setWithdrawModalOpen(false); 
                        setApplyModalOpen(false);
                    })
                }
            } catch (error) {
                console.log(error);
                setIsLoadingApplication(false);
            }
        }
    }

    const handleWithdrawApplication = async e => {
        const applicationData = { status: 'withdraw' }
        if (!isLoadingApplication)
        {
            setIsLoadingApplication(true);
            try {
                axios.put(`${getBackendURL()}/event/users/${id}/${currentUser.user_id}`, applicationData, { withCredentials: true }).then(res => {
                    getEventData(); //Reload data
                    toast("Application Withdrawn", toastSuccess);
                    setWithdrawModalOpen(false); 
                    setApplyModalOpen(false);
                    setIsLoadingApplication(false);
                });  
            } catch (err) {
                console.log(err)
                setIsLoadingApplication(false);
            }
        }
        
    }

    const handleAcceptApplication = async (user, email=false) => {
        const applicationData = { status: 'accept' }
        const applicantEmail = {
            to: user.email,
            subject: `Application Accepted for ${event.event_name}`,
            html:
            `<h2>Application Accepted!</h2>
            <p>Congratulations! Your application to <a href="https://harmonize.rocks/event/${event.event_id}">${event.event_name}</a> has been accepted! The event details are below</p>
            <p><b>Date: </b>${formatDate(event.start_time)}</p>
            <p><b>Time: </b>${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
            <p><b>Location: </b>${event.Address.street} ${event.Address.city}, ${event.Address.state} ${event.Address.zip}</p>
            <p>Please plan on attending the event. If you haven't already, reach out to the event owner for more details including any possible rehearsals.</p>
            <p>If you can no longer attend the event, let the venue owner know as soon as possible.</p>
            <p>Happy Gigging!</p>
            <hr>
            <small>This is an automated email sent by <a href="https://harmonize.rocks" target="_blank">Harmonize</a>. Do not reply or send messages to this email address (harmonizeapp@outlook.com), it will not be seen.</small>
            `
        };
        try {
            axios.put(`${getBackendURL()}/event/users/${id}/${user.user_id}`, applicationData, { withCredentials: true }).then(res => {
                getEventData(); //Reload data
                if (email) axios.post(`${getBackendURL()}/api/email`, applicantEmail, { withCredentials: true });
                toast("Application Accepted", toastSuccess);
            });
        } catch (err) {
            console.log(err)
        }
    }

    const handleRejectApplication = async (user, email=false) => {
        const applicationData = { status: 'reject' }
        const applicantEmail = {
            to: user.email,
            subject: `Application Rejected for ${event.event_name}`,
            html:
            `<h2>Application Accepted!</h2>
            <p>We regret to inform you that your application to <a href="https://harmonize.rocks/event/${event.event_id}">${event.event_name}</a> has been rejected.</p>
            <p>This only applies to this event. This does not effect any other applications for other events that are still pending.</p>
            <p>We wish you luck in other event endeavors!</p>
            <hr>
            <small>This is an automated email sent by <a href="https://harmonize.rocks" target="_blank">Harmonize</a>. Do not reply or send messages to this email address (harmonizeapp@outlook.com), it will not be seen.</small>
            `
        };
        try {
            axios.put(`${getBackendURL()}/event/users/${id}/${user.user_id}`, applicationData, { withCredentials: true }).then(res => {
                getEventData(); //Reload data
                if (email) axios.post(`${getBackendURL()}/api/email`, applicantEmail, { withCredentials: true });
                toast("Application Rejected", toastSuccess);
            });
        } catch (err) {
            console.log(err)
        }
    }

    const addLineBreak = (str) =>
    str.split('\n').map((subStr, index) => {
        return (
        <p key={index}>
            {subStr}
            <br />
        </p>
        );
    });

    if (loading) {
        return <ClipLoader />;
    }

    return (
        <div>
            <Title title={event?.event_name ? event.event_name : "Event"} />
            <hr />
            <Container> 
                <div style={{textAlign: "left"}}>
                    <Row>
                        <Col>
                            <h1>{event.event_name}</h1>
                        </Col>
                        <Col lg="auto" style={{ display: 'flex', justifyContent: 'right'}}>
                        {isEventOwner() ? (
                            <Link to={`/form/${id}`} style={{ color: "#fff" }}>
                                <Button className="editEvent">Edit Event</Button>
                            </Link>
                        ) : (
                            <Link to={`/calculator/${event.event_id}?event=true`} style={{ color: "#fff" }}>
                                <Button className="sendToCalc">Send to Calculator</Button>
                            </Link>
                        )}
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col className="mb-3" lg={8} md={8}>
                            <Card className="shadow" id="infoCard" style={{height: "100%"}} >
                                <Card.Header>
                                    <h3>Event Information</h3>
                                    {isEventOwner() && event.is_listed && <><br /><h5 style={{color: "rgb(40, 150, 50)"}}>Event is currently listed</h5></>}
                                    {isEventOwner() && !event.is_listed && <><br /><h5 style={{color: "rgb(200, 40, 50)"}}>Event is currently unlisted</h5></>}
                                </Card.Header>
                                <Card.Body>
                                    <Col>
                                        
                                        <Row>
                                            <Col>
                                                <Row>
                                                    <Col xs="auto" lg={colSize.lg} xl={colSize.xl}><h5>Date</h5></Col>
                                                    <Col><p>{formatDate(event.start_time)}</p></Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="auto" lg={colSize.lg} xl={colSize.xl}><h5>Location</h5></Col>
                                                    <Col lg="auto"><p>
                                                    {event.Address && (
                                                        <Link target="blank" to={`https://www.google.com/maps/search/?api=1&query=${event.Address.street}+${event.Address.city}+${event.Address.state}+${event.Address.zip}`}>
                                                            {event.Address.street} <br /> {event.Address.city}, {event.Address.state} {event.Address.zip}
                                                        </Link>
                                                    )}
                                                    </p></Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="auto" lg={colSize.lg} xl={colSize.xl}><h5>Pay</h5></Col>
                                            
                                                    <Col><p>{formatCurrency(event.pay)}</p></Col>
                                                </Row>
                                            </Col>
                                            <Col>
                                                <Row>
                                                    <Col lg="auto"><h5>Time</h5></Col>
                                                    <Col className="text-start"><p>{formatTime(event.start_time)} - {formatTime(event.end_time)}</p></Col>
                                                </Row>
                                                <Row>
                                                    <Col size="auto"><h5>Event Hours</h5></Col>
                                                    <Col><p>{event.event_hours > 0 ? event.event_hours % 1 != 0 ? event.event_hours.toFixed(2): event.event_hours : 0}</p></Col>
                                                </Row>
                                                <Row>
                                                    <Col size="auto"><h5>Rehearsal Hours</h5></Col>
                                                    <Col><p>{event.rehearse_hours > 0 ? event.rehearse_hours % 1 != 0 ? event.rehearse_hours.toFixed(2): event.rehearse_hours : 0}</p></Col>
                                                </Row>
                                                <Row><hr style={{width: "75%"}}/></Row>
                                                <Row>
                                                    
                                                    <Col size="auto"><h5>Total Hours</h5></Col>
                                                    <Col><p>{event.rehearse_hours + event.event_hours > 0 ? (event.rehearse_hours+event.event_hours) % 1 != 0 ? (event.rehearse_hours + event.event_hours).toFixed(2): event.rehearse_hours + event.event_hours : 0}</p></Col>
                                                </Row>
                                            </Col>
                                            <hr />
                                        </Row>
    
                                        <Row>
                                            <Container>
                                            <Col xs={colSize.xs} sm={colSize.sm} md={colSize.md} lg={colSize.lg} xl={colSize.xl}><h5>Description</h5></Col>
                                            <Col>{event.description != "" ? addLineBreak(event.description) : <Card.Text className="text-muted"><p>No description provided</p></Card.Text>}</Col>
                                            </Container>
                                        </Row>
                                    </Col>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className="mb-3">
                            <Card className="shadow text-center">
                                <Card.Header>
                                    <h3>Owner Information</h3>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col><h5>Posted by - {event.Users && event.Users.length > 0 && (event.Users && <Link to={`/profile/${owner.user_id}`} style={{ color: "#000" }}>{owner.f_name} {owner.l_name}</Link>)}</h5></Col>
                                    </Row>
                                    <Row>
                                        <Col><h5>Contact - {owner.email} </h5></Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        
                            <Card className="shadow text-center mt-3">
                                <Card.Header>
                                    <h3>Instruments Needed</h3>
                                </Card.Header>
                                <Card.Body>
                                    <Container>
                                    {event.Instruments && event.Instruments.length > 0 ? event.Instruments.map((instrument, index) => (
                                        <Row key={index}><h5>{instrument.name}</h5></Row>
                                    )) : <Card.Text className="text-muted">No instruments provided</Card.Text>}
                                    </Container>
                                </Card.Body>
                            </Card>

                            {!isEventOwner() &&
                            <Card className="shadow text-center mt-3">
                                <Card.Header>
                                    <h3>Application</h3>
                                </Card.Header>
                                <Card.Body>
                                    {currentUser ? 
                                        applications.some(user => user.user_id === currentUser.user_id && user.UserStatus.status === 'applied') ? (
                                        <>
                                        <Button className="withdrawButton" onClick={() => {setWithdrawModalOpen(true)}}>Withdraw from Event</Button>
                                        {withdrawModalOpen &&
                                        <Modal show={withdrawModalOpen} onHide={() => {setWithdrawModalOpen(false);}} centered={true}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Withdraw Confirmation</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <p>Are you sure you want to withdraw your application from this event?</p>
                                                <Button variant="danger" onClick={() => {setWithdrawModalOpen(false)}}>Cancel</Button>
                                                <Button className="mx-3" variant="success" onClick={() => {handleWithdrawApplication();}}> {isLoadingApplication ? <BarLoader color="#FFFFFF" height={4} /> : "Withdraw"}</Button>
                                            </Modal.Body>
                                        </Modal>
                                        }
                                        </>
                                    ) : (
                                        accepted.some(user => user.user_id === currentUser.user_id && user.UserStatus.status === 'accept') ? (
                                            <h5><span style={{color: "green"}}><b>Congratulations!</b></span><br />You've been accepted for this event, get in touch with <Link to={`/profile/${owner.user_id}`} style={{ color: "#000" }}>{owner.f_name} {owner.l_name}</Link> for more details!</h5>
                                        ) : (
                                            rejected.some(user => user.user_id === currentUser.user_id && user.UserStatus.status === 'reject') ? (
                                                <h5><span style={{color: "red"}}><b>We're sorry.</b></span><br />You've not been chosen to participate in this event.</h5>
                                            ) : (
                                                <>
                                                <Button className="applyButton" onClick={() => setApplyModalOpen(true)}>Apply to Event</Button>
                                                {applyModalOpen &&
                                                <Modal show={applyModalOpen} onHide={() => {setApplyModalOpen(false);}} centered={true}>
                                                    <Form id="applyModalForm" onSubmit={e => e.preventDefault()}>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Event Application</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <p>Apply to this event by providing contact email. You may also add a brief message to send to the organizer.</p>
                                                                <Form.Label>Contact Email</Form.Label>
                                                                <InputGroup className="mb-2">
                                                                    <Form.Control value={applyModalData.email} onChange={e => {setApplyModalData({...applyModalData, email: e.target.value});}} placeholder={"Ex. email@gmail.com"} required={true} pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"></Form.Control>
                                                                    <TooltipButton text="Email you wish to be contacted at. By default, it is set to your profile email."/>
                                                                </InputGroup>
                                                                <Form.Label>Message</Form.Label>
                                                                <Form.Control value={applyModalData.message} as="textarea" rows={3} onChange={e => {setApplyModalData({...applyModalData, message: e.target.value}); e.target.setCustomValidity("");}} pattern={`[a-zA-Z0-9\s'"\/()]`} placeholder={"Message (Optional)"} autoFocus={true}></Form.Control>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                            <Button type="submit" variant="primary" onClick={() => {handleAddApplication(currentUser, true);}}>
                                                                {isLoadingApplication ? <BarLoader color="#FFFFFF" height={4} /> : "Apply"}
                                                            </Button>
                                                            </Modal.Footer>
                                                    </Form>
                                                </Modal>
                                                }
                                                </>
                                            )
                                        )
                                    ) : <Button variant='primary' href="/account">Please log in to apply for this event!</Button>}
                                </Card.Body>
                            </Card>
                            }
                        </Col>
                    </Row>
                </div> 
            </Container>

            {/* Applications */}
            <Container> 
            {currentUser && isEventOwner() &&
                <div style={{textAlign: "left"}}>
                    <Row>
                        <Col className="my-3">
                            <Card className="shadow" id="infoCard" style={{height: "100%"}} >
                                <Card.Header>
                                    <h3>Musician Applications</h3>
                                </Card.Header>
                                <Card.Body>
                                    <Col>
                                        <Row><h5>Pending Applications</h5></Row>
                                        {applications.length > 0 ? applications.map((user, index) => (
                                            <Row key={index} style={{ marginBottom: '1rem', alignItems: "center", textAlign: "left" }}>
                                                <Col sm="2">
                                                    <Link to={`/profile/${user.user_id}`} style={{ color: "#000" }} className="user-profile-link">
                                                        {user.f_name} {user.l_name}
                                                    </Link>
                                                </Col>
                                                <Col sm="auto"><Button variant="success" size="sm" onClick={() => handleAcceptApplication(user, true)}>Accept</Button></Col>
                                                <Col sm="auto"><Button variant="danger" size="sm" onClick={() => handleRejectApplication(user, true)}>Reject</Button></Col>
                                            </Row>
                                        )) : <Card.Text className="text-muted">No pending applications</Card.Text>}
                                        <hr />
                                        <Row><h5>Accepted Applications</h5></Row>
                                        {accepted.length > 0 ? accepted.map((user, index) => (
                                            <Row key={index} style={{ marginBottom: '1rem', alignItems: "center", textAlign: "left" }}>
                                                <Col lg="3" sm="3" xs="3">
                                                    <Link to={`/profile/${user.user_id}`} style={{ color: "#000" }} className="user-profile-link">
                                                        {user.f_name} {user.l_name}
                                                    </Link>
                                                </Col>
                                                <Col lg="auto"><Button size="sm" onClick={() => handleAddApplication(user)}>Move to Pending</Button></Col>
                                                <Col lg="auto"><Button variant="danger" size="sm" onClick={() => handleRejectApplication(user, true)}>Reject</Button></Col>
                                            </Row>
                                        )) : <Card.Text className="text-muted">No accepted applications</Card.Text>}
                                        <hr />
                                        <Row><h5>Rejected Applications</h5></Row>
                                        {rejected.length > 0 ? rejected.map((user, index) => (
                                            <Row key={index} style={{ marginBottom: '1rem', alignItems: "center", textAlign: "left" }}>
                                                <Col sm="2">
                                                    <Link to={`/profile/${user.user_id}`} style={{ color: "#000" }} className="user-profile-link">
                                                        {user.f_name} {user.l_name}
                                                    </Link>
                                                </Col>
                                                <Col sm="auto"><Button size="sm" onClick={() => handleAddApplication(user)}>Move to Pending</Button></Col>
                                            </Row>
                                        )): <Card.Text className="text-muted">No rejected applications</Card.Text>}
                                        <hr />
                                    </Col>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div> 
                }
            </Container>
        </div>
    )
}

export default IndividualEvent