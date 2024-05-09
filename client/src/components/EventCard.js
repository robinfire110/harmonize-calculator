import { React, useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getBackendURL, getEventOwner } from "../Utils"

function EventCard({eventId}) {
    //Get Data
    const descriptionCharacterLimit = 200;
    const [eventData, setEventData] = useState();
    const [owner, setOwner] = useState()
    const [deviceType, setDeviceType] = useState("browser");
    
    //Call API
    useEffect(() => {
        axios.get(`${getBackendURL()}/event/id/${eventId}`).then(res => {
            //Set data
            setEventData(res.data);
            //console.log(res.data);

            //Get owner
            setOwner(getEventOwner(res.data));

            //Set update style
            window.addEventListener("resize", updateStyle); 
        }).catch(error => {
            console.log(error);
        });
    }, [])

    //Update style based on width
    function updateStyle()
    {
        if (window.innerWidth >= 992) setDeviceType("browser");
        else setDeviceType("mobile");
    }

    return (
        <div>
        <Card className="m-2 shadow-sm" style={{backgroundColor: "#e3e3e3", width: deviceType == "browser" ? "23rem" : "18rem", height: "28rem", marginLeft: "auto", marginRight: "auto", textAlign: "left"}}>
            <Card.Header>
                <Card.Title><Link to={`/event/${eventId}`} style={{color: "#000"}}><h4>{eventData && eventData.event_name}</h4></Link></Card.Title>
                <h6>Posted by:</h6> {owner && <Link to={`/profile/${owner.user_id}`} style={{color: "#000"}}>{owner.f_name} {owner.l_name}</Link>}
                <br />
                <h6>Date Posted:</h6> {eventData && moment(eventData.date_posted).format("M/DD/YYYY")}
                <br />
                <h6>Event Date:</h6> {eventData && moment(eventData.start_time).format("M/DD/YYYY")}
                <br />
                <h6>Event Time:</h6> {eventData && moment(eventData.start_time).format("h:mm A")} - {eventData && moment(eventData.end_time).format("h:mm A")}
                <br />
                <h6>Location:</h6> {eventData && eventData.Address.city}, {eventData && eventData.Address.state}
                <br />
                <h6>Instruments:</h6> {eventData && eventData.Instruments[0] ? eventData.Instruments.map(instrument => instrument.name).join(', ') : "None"}
            </Card.Header>
            <Card.Body>
                {eventData && eventData.description.length > 0 ? (
                <Card.Text style={{overflow: "clip", maxHeight: "100px"}}>
                         {eventData.description.length > descriptionCharacterLimit ?`${eventData.description.substring(0, descriptionCharacterLimit)}...` : eventData.description}
                </Card.Text>
                ) :  
                <Card.Text className='text-muted'>No description provided</Card.Text>}             
            </Card.Body>
            <Card.Footer>
                <Button variant='primary' href={`/event/${eventId}`}>See more</Button>
            </Card.Footer>
        </Card>
        </div>
    )
}

export default EventCard;