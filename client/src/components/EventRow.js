import React from "react";
import { Button, Row, Col, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getEventOwner } from "../Utils";

const EventRow = ({ event, goToEvent, formatDate, index, deviceType="browser" }) => {
    let backgroundColor = "rgba(255, 255, 255, 1)"
    if (index % 2 != 0) backgroundColor = "rgba(100, 100, 100, .15)";
    const owner = getEventOwner(event);

    //Instruments
    const instrumentNames = event.Instruments.map((instrument) => {
        return instrument.name;
    })

    const getLayout = () => {
        if (deviceType === "browser")
        {
            return (
                <Row style={{background: backgroundColor}} className="py-2 align-items-center">
                    <Col lg={1}><div>{formatDate(event.start_time)}</div></Col>
                    <Col lg={2}><div>{event.event_name}</div></Col>
                    <Col lg={1}><div>${event.pay}</div></Col>
                    <Col lg={2}><div>{instrumentNames.length > 0 ? instrumentNames.join(", ") : <div className="text-muted">No instruments provided</div>}</div></Col>
                    <Col lg={2}><div><Link to={`/profile/${owner.user_id}`} style={{color: "black"}}>{owner?.f_name} {owner?.l_name}</Link></div></Col>
                    <Col lg={3}><div>
                            {event.Address && (
                                <div>
                                    {event.Address.street},<br />{event.Address.city} {event.Address.state}, {event.Address.zip}
                                </div>
                            )}
                        </div></Col>
                    <Col lg={1}><Button size="sm" onClick={() => goToEvent(event.event_id)}>View</Button></Col>
                </Row>
            )
        }
        else
        {
            return (
                <Row style={{background: backgroundColor}} className="py-2 align-items-top">
                    <Col className="mb-2" md={4} sm={4} xs={{order: 7, span: 6}}>
                        <Row><div><b>Name </b></div></Row>
                        <Row><div>{event.event_name}</div></Row>
                    </Col>
                    <Col className="mb-2" md={4} sm={4} xs={{order: 6, span: 6}}>
                        <Row><div><b>Organizer </b></div></Row>
                        <Row><div><Link to={`/profile/${owner.user_id}`} style={{color: "black"}}>{owner?.f_name} {owner?.l_name}</Link></div></Row>
                    </Col>
                    <Col className="mb-2" md={2} sm={3} xs={{order: 1, span: 6}}>
                        <Row><div><b>Date </b></div></Row>
                        <Row><div>{formatDate(event.start_time)}</div></Row>
                    </Col>
                    <Col className="mb-2" md={4} sm={4} xs={{order: 3, span: 12}}>
                        <Row><div><b>Instruments </b></div></Row>
                        <Row><div>{instrumentNames.length > 0 ? instrumentNames.join(", ") : <div className="text-muted">No instruments provided</div>}</div></Row>
                    </Col>
                    <Col className="mb-2" md={4} sm={5} xs={{order: 3, span: 8}}>
                        <Row><div><b>Address </b></div></Row>
                        <Row><div>
                                    {event.Address && (
                                        <div>
                                            {event.Address.street},<br />{event.Address.city} {event.Address.state}, {event.Address.zip}
                                        </div>
                                    )}
                                </div></Row>
                    </Col>
                    <Col className="mb-2" md={2} sm={3} xs={{order: 2, span: 6}}>
                        <Row><div><b>Pay </b></div></Row>
                        <Row><div>${event.pay}</div></Row>
                    </Col>
                    <Col className="mb-2 p-10" md={12} sm={12} xs={{order: 5, span: 12}}>
                        <Row><Button className="p-10" size="sm" onClick={() => goToEvent(event.event_id)}>View</Button></Row>
                    </Col>
                </Row>
            )
        }
    }

    return (
        <Container>
            <Link to={`/event/${event.event_id}`} style={{color: "rgba(0, 0, 0, 1)", textDecoration: "none"}}>
                {getLayout()}
            </Link>
        </Container>
    )
}

export default EventRow;