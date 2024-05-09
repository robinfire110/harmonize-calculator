import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Container, Form, Col, Row, Button, InputGroup } from "react-bootstrap";
import moment from "moment";
import { useCookies } from "react-cookie";
import { ClipLoader, BarLoader } from "react-spinners";
import { maxDescriptionLength, maxEventNameLength, parseFloatZero, statesList, getBackendURL, toastSuccess, toastError, toastInfo} from "../Utils";
import FormNumber from "../components/FormNumber";
import Select from 'react-select';
import { toast } from "react-toastify";
import TooltipButton from "../components/TooltipButton";
import Title from "../components/Title";

const EventForm = () => {
    const [event, setEvent] = useState({
        event_name: "",
        start_time: new moment().format("YYYY-MM-DD HH:mm:ss"),
        end_time: new moment().format("YYYY-MM-DD HH:mm:ss"),
        description: "",
        pay: null,
        event_hours: "",
        is_listed: null
    })

    const [address, setAddress] = useState({
        street: "",
        city: "",
        zip: "",
        state: "AL"
    })

    const [cookies, removeCookie] = useCookies([]);
    const [userId, setUserId] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [instruments, setInstruments] = useState([])
    const [selectedInstruments, setSelectedInstruments] = useState([])
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("14:00");
    const [totalEventHours, setTotalEventHours] = useState(0);
    const [startDate, setStartDate] = useState(new moment().add(1, 'd').format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(new moment().add(1, 'd').format("YYYY-MM-DD"));
    const [loading, setLoading] = useState(true);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);
    const [descriptionLength, setDescriptionLength] = useState(maxDescriptionLength);
    const [nameLength, setNameLength] = useState(maxEventNameLength);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate()
    const { id } = useParams();

    useEffect(() => {
        //fetch instruments needed for tags
        axios.get(`${getBackendURL()}/instrument/`).then(async (res) => {
            //Create instruments
            setInstruments(configureInstrumentList(res.data));
        }).catch(error => {
            console.log(error);
            setLoading(false);
        });

        //get user
        if (cookies.jwt) {
            axios.get(`${getBackendURL()}/account`, { withCredentials: true }).then(res => {
                //Set user
                const userData = res.data?.user;
                if (userData) {
                    setUserId(userData);
                    setUserLoggedIn(true);
                }

                if (id && userData?.user_id) { //If the previous page had an id, then it's going to be stored and autofill fields with info
                    axios.get(`${getBackendURL()}/event/user_id/event_id/${userData.user_id}/${id}?owner=true`, { withCredentials: true }).then((res) => {
                        const data = res.data[0];
                        if (data && data.Users[0].user_id == userData.user_id)
                        {
                            setEvent(data);
                            setAddress({
                                street: data.Address.street,
                                city: data.Address.city,
                                zip: data.Address.zip,
                                state: data.Address.state
                            })
                            setOwnerId(data.Users.length > 0 ? data.Users[0].user_id : null);
        
                            //autofill data selectedInstruments from id
                            setSelectedInstruments(configureInstrumentList(data.Instruments));
        
                            //autofill data start and end times from id
                            const startTime = moment.utc(data.start_time).local().format("HH:mm:ss");
                            const endTime = moment.utc(data.end_time).local().format("HH:mm:ss");
        
                            setStartTime(startTime);
                            setEndTime(endTime);
        
                            //autofill data of start and end date
                            const startDate = moment.utc(data.start_time).format("YYYY-MM-DD");
                            const endDate = moment.utc(data.end_time).format("YYYY-MM-DD");
        
                            setStartDate(startDate);
                            setEndDate(endDate);
                            setLoading(false);
                        }
                        else
                        {
                            navigate("/form");
                            toast("You do not have access to this page.", toastError);
                        }
                    }).catch(error => {
                        console.log(error);
                        navigate("/form");
                        toast("You do not have access to this page.", toastError);
                    });
                } else {
                    setOwnerId(null);
                    setLoading(false);
                }

            }).catch(error => {
                setLoading(false);
            })
        }
        else
        {
            setUserLoggedIn(false);
            setLoading(false);
        }
        
    }, [cookies.jwt]);

    //Update total event hours
    useEffect(() => {
        const eventHours = moment(`${endDate} ${endTime}`).diff(moment(`${startDate} ${startTime}`), "hours", true);
        const rehearsalHours = parseFloatZero(event.rehearse_hours);
        console.log(eventHours);
        setTotalEventHours(eventHours+rehearsalHours > 0 ? (eventHours+rehearsalHours) % 1 != 0 ? (eventHours+rehearsalHours).toFixed(2): eventHours+rehearsalHours : 0);
    }, [startDate, startTime, endDate, endTime, event.rehearse_hours])

    //Update description length
    useEffect(() => {
        const descriptionBox = document.getElementById("eventDescription");
        if (descriptionBox)
        {
            setDescriptionLength(maxDescriptionLength-descriptionBox.value.length);
        }
        
    }, [event.description]);

    //Update name length
    useEffect(() => {
        const nameBox = document.getElementById("eventName");
        if (nameBox)
        {
            setNameLength(maxEventNameLength-nameBox.value.length);
        } 
    }, [event.event_name]);
    
    //Handle most changes
    const handleChange = (e) => {
        console.log(e.target.name);
        setEvent(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    //Hand date change
    const handleDateTimeChange = (name, e) => {
        //Variables
        const value = e.target.value;
        const currentStartDate = name === "start_date" ? value : startDate;
        const currentStartTime = name === "start_time" ? value : startTime;
        const currentEndTime = name === "end_time" ? value : endTime;
        const currentEndDate = name === "end_date" ? value : endDate;
        const startDateTime = moment(`${currentStartDate} ${currentStartTime}`);
        const endDateTime = moment(`${currentEndDate} ${currentEndTime}`);
        console.log(startDateTime, endDateTime);
        
        //Update
        switch (name)
        {
            case "start_date": setStartDate(value); break;
            case "start_time": setStartTime(value); break;
            case "end_date": setEndDate(value); break;
            case "end_time": setEndTime(value); break;
        }

        //Set end date if later than start date (will override above setting)
        if ((name == "start_date" || name == "start_time") && endDateTime.isBefore(startDateTime))
        {
            endDateTime.set({year: startDateTime.get('year'), month: startDateTime.get('month'), date: startDateTime.get('date'), minute: startDateTime.get('minute')});
            if (endDateTime.isBefore(startDateTime, "hour"))
            {
                endDateTime.set({hour: startDateTime.get('hour')});
                endDateTime.add(1, "hour");
            } 
            setEndDate(endDateTime.format("YYYY-MM-DD"));
            setEndTime(endDateTime.format("HH:mm:ss"));
            if (name === "end_date")
            {
                e.target.setCustomValidity("End date must be after start date.");
                e.target.reportValidity();
            } 
            if (name === "end_time")
            {
                e.target.setCustomValidity("End time must be after start time.");
                e.target.reportValidity();
            } 
        }
    }

    //need to put together date and time from selections into format transferrable to the database
    const formatDateTime = (startDate, startTime, endDate, endTime) => {

        //combine date and time into a single string for each start and end time
        const startDateTimeString = `${startDate} ${startTime}`;
        const endDateTimeString = `${endDate} ${endTime}`;

        //format the combined string as a DATETIME object
        const formattedStartDateTime = moment(startDateTimeString, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        const formattedEndDateTime = moment(endDateTimeString, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');

        return { start: formattedStartDateTime, end: formattedEndDateTime };
    }

    //Configure instrument list (to work with special select)
    const configureInstrumentList = (data) => {
        const instrumentOptionList = []
        data.forEach(instrument => {
            instrumentOptionList.push({value: instrument.instrument_id, label: instrument.name});
        });
        return instrumentOptionList
    }

    const checkFormValidity = () => {
        //Check validity (will return false if not valid, HTML will take care of the rest).
        const inputs = document.getElementById("eventForm").elements;
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].disabled && !inputs[i].checkValidity())
            {
                inputs[i].reportValidity();
                console.log("NOT VALID");
                setIsSubmitting(false);
                return false
            } 
        }
        return true;
    }

    //seperate handler for address changes
    const handleAddressChange = (name, value) => {
        setAddress(prev => ({ ...prev, [name]: value }))
    }

    const handleEvent = async e => {
        e.preventDefault()
        if (!isSubmitting)
        {
            setIsSubmitting(true);
            try {
                //Check validity
                if (!checkFormValidity()) return false;

                const isListed = 1
                const { start: startDateTime, end: endDateTime } = formatDateTime(startDate, startTime, endDate, endTime);

                //Prepare instrument data
                const instrumentsList = [];
                selectedInstruments.forEach(instrument => {
                    instrumentsList.push(instrument.value);
                });

                //Prepare optional values
                event.rehearse_hours = parseFloatZero(event.rehearse_hours);
                event.mileage_pay = parseFloatZero(event.mileage_pay);

                //prepare data to be sent to database with event details
                const eventData = { ...event, start_time: startDateTime, end_time: endDateTime, instruments: instrumentsList, address, is_listed: isListed };
                console.log(eventData);
                console.log("Instruments", instrumentsList);

                //if an id is present, that means the event already exists and we need to put
                if (id) {
                    const response = await axios.put(`${getBackendURL()}/event/${id}`, eventData, { withCredentials: true });
                    setIsSubmitting(false);
                    navigate(`../event/${id}`)
                    toast("Event Updated", toastSuccess);
                } else {
                    //event does not exist, so make a post
                    setIsSubmitting(false);
                    const eventData = { ...event, user_id: userId.user_id, start_time: startDateTime, end_time: endDateTime, instruments: instrumentsList, address, is_listed: isListed };
                    const response = await axios.post(`${getBackendURL()}/event/`, eventData, { withCredentials: true })
                    const newEventId = response.data.newEvent.event_id;
                    navigate(`../event/${newEventId}`);
                    toast("Event Created", toastSuccess);
                }
            } catch (error) {
                console.log(error);
                toast("An error occured when creating event.", toastError);
                setIsSubmitting(false);
            }
        }
    }

    const handleUnlistEvent = async e => {
        e.preventDefault()
        if (!isDeleting)
        {
            setIsDeleting(true);
            try {
                const listingUpdate = {is_listed : 0};
                const response = await axios.put(`${getBackendURL()}/event/${id}`, listingUpdate, { withCredentials: true })
                setIsDeleting(false);
                navigate(`../event/${id}`)
                toast("Event Unlisted", toastSuccess);
            } catch (err) {
                console.log(err)
                setIsDeleting(false);
            }
        }   
    }

    const handleRelistEvent = async e => {
        e.preventDefault()
        if (!isDeleting)
        {
            try {
                //Check validity
                if (!checkFormValidity()) return false;

                const listingUpdate = {is_listed : 1};
                const response = await axios.put(`${getBackendURL()}/event/${id}`, listingUpdate, { withCredentials: true })
                setIsDeleting(false);
                navigate(`../event/${id}`)
                toast("Event Relisted", toastSuccess);
            } catch (err) {
                console.log(err)
                setIsDeleting(false);
            }
        }
        
    }

    const isEventOwner = () => {
        return ownerId && userId && ownerId === userId.user_id;
    }

    if ((ownerId === null && userId !== null) || isEventOwner()) {
        return (
            <div>
                <Title title={id ? "Edit Event" : "List Event"}/>
                <div className='form'>
                    <h1>{id ? "Edit Event" : "List Event"}</h1>
                    <hr />
                    <Container style={{ textAlign: "left" }}>
                        <h3>Event Information</h3>
                        <hr />
                        <Form id="eventForm">
                            <Form.Group>
                                <Row>
                                <Col lg={8}>
                                    <Row className="mb-3">
                                        <Col>
                                            <Form.Label style={{width: '100%'}}>
                                                <Row>
                                                    <Col lg={10}>Event name<span style={{color: "red"}}>*</span></Col>
                                                    <Col className="text-end">{nameLength}/{maxEventNameLength}</Col>
                                                </Row>
                                            </Form.Label>
                                            <InputGroup>
                                                <Form.Control id="eventName" maxLength={maxEventNameLength} type="text" placeholder='Event name' value={event.event_name} onChange={handleChange} name="event_name" required={true} pattern={`[a-zA-Z0-9\\s'"-]+`}></Form.Control>
                                                <TooltipButton text="Name of event. 50 character limit."/>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Label>Instruments</Form.Label>
                                        <div name="instruments"><Select options={instruments} name={"instruments"} isMulti onChange={(selectedOptions) => setSelectedInstruments(selectedOptions)} value={selectedInstruments} ></Select></div>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col>
                                            <Form.Label style={{width: '100%'}}>
                                                <Row>
                                                    <Col lg={10}>Description</Col>
                                                    <Col className="text-end">{descriptionLength}/{maxDescriptionLength}</Col>
                                                </Row>
                                            </Form.Label>
                                            <InputGroup>
                                                <Form.Control as="textarea" id="eventDescription" rows={7} maxLength={maxDescriptionLength} type="text" placeholder='Event Description (750 character max)' value={event.description} onChange={handleChange} name="description"></Form.Control>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row className="mb-3">
                                        <Form.Label>Start Time<span style={{color: "red"}}>*</span></Form.Label>
                                        <Col>
                                            <Form.Control name="start_date" type="date" min={moment().format("YYYY-MM-DD")} value={startDate} onChange={(e) => handleDateTimeChange('start_date', e)} required={true}></Form.Control>
                                        </Col>
                                        <Col>
                                            <Form.Control type="time" value={startTime} onChange={(e) => handleDateTimeChange("start_time", e)} required={true}></Form.Control>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 align-items-center">
                                        <Form.Label>End Time<span style={{color: "red"}}>*</span></Form.Label>
                                        <Col>
                                            <Form.Control name="end_date" type="date" min={startDate} value={endDate} onChange={(e) => handleDateTimeChange('end_date', e)} required={true}></Form.Control>
                                        </Col>
                                        <Col>
                                            <Form.Control type="time" min={startTime} value={endTime} onChange={(e) => handleDateTimeChange("end_time", e)} required={true}></Form.Control>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label>Rehearsal Hours</Form.Label>
                                            <InputGroup>
                                                <FormNumber maxValue={100} name="rehearse_hours" integer={false} placeholder='Ex. 3' value={event.rehearse_hours} onChange={(e) => {handleChange(e)}} />
                                                <TooltipButton text="How many hours of rehearsal expected from musicians (optional)." />
                                            </InputGroup>
                                            
                                        </Col>
                                        <Col>
                                            <Form.Label>Total Event Hours</Form.Label>
                                            <InputGroup>
                                                <Form.Control type="number" placeholder='0' value={totalEventHours} name="event_hours" disabled={true}></Form.Control>
                                                <TooltipButton text="Total number of hours expected from musician. Calculated by start/end time and rehearsal hours." />
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </Col>
                                </Row>

                                <hr />
                                <Row className="mb-3">
                                    {/* Address Fields */}
                                    <Col lg={8}>
                                        <h3>Event Location</h3>
                                        <p></p>
                                        <Row className="my-3">
                                            <Row className="mb-3">
                                                <Col lg={9}>
                                                    <Form.Label>Street<span style={{color: "red"}}>*</span></Form.Label>
                                                    <Form.Control name="street" type="text" placeholder='Ex. 1234 Road St.' value={address.street} onChange={(e) => handleAddressChange("street", e.target.value)} pattern="[a-zA-Z0-9\s']+" required={true}/>
                                                </Col>
                                                <Col>
                                                    <Form.Label>State<span style={{color: "red"}}>*</span></Form.Label>
                                                    <Form.Select required={true} value={address.state} onChange={(e) => handleAddressChange("state", e.target.value)}>
                                                        {statesList.map((state) => {return(<option value={state} key={state}>{state}</option>)})}
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3">
                                                <Col lg={9}>
                                                    <Form.Label>City<span style={{color: "red"}}>*</span></Form.Label>
                                                    <Form.Control name="city" type="text" placeholder='Ex. Boston' value={address.city} onChange={(e) => handleAddressChange("city", e.target.value)} pattern="[a-zA-Z\s.,']+" required={true}/>
                                                </Col>
                                                
                                                <Col>
                                                    <Form.Label>Zip Code<span style={{color: "red"}}>*</span></Form.Label>
                                                    <FormNumber name="zip" placeholder='Ex. 27413' value={address.zip} onChange={(e) => {handleAddressChange("zip", e.target.value); e.target.setCustomValidity("")}} max={5} min={5} required={true} customValidity={"Zip codes must be 5 characters (#####)."}/>
                                                </Col>
                                            </Row>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <h3>Event Finance</h3>
                                        <p></p>
                                        <Row className="my-3">
                                            <Form.Label>Pay<span style={{color: "red"}}>*</span></Form.Label>
                                            <Col>
                                                <InputGroup>
                                                    <InputGroup.Text>$</InputGroup.Text>
                                                    <FormNumber name="pay" maxValue={9999.99} value={event.pay} placeholder="Ex. $150.00" required={true} integer={false} onChange={handleChange} name="pay"/>
                                                    <TooltipButton text="How much musician will be paid for this event." />
                                                </InputGroup>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Label>Mileage Pay</Form.Label>
                                            <Col>
                                                <InputGroup>
                                                    <InputGroup.Text>$</InputGroup.Text>
                                                    <FormNumber name="mileage_pay" maxValue={1.00} placeholder='Ex. $0.17' value={event.mileage_pay} integer={false} onChange={handleChange} name="mileage_pay" />
                                                    <TooltipButton text="How much mileage pay is provided, in $/mile (optional)."/>
                                                </InputGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <hr />

                            </Form.Group>
                            {/* Add if else logic: If event=true (Event is being updated), update event, else (this is a new event) list event */}
                            <div style={{ marginBottom: "2em", marginTop: "2em" , textAlign: "center"}}>
                                {id ? (
                                    <div className="update-unlist">
                                        <Button type="submit" className="formButton" variant="success" onClick={handleEvent} style={{ marginRight: '10px'}}>{isSubmitting ? <BarLoader color="#FFFFFF" height={4} width={50} /> : "Update Event"}</Button>
                                        {event.is_listed ? (
                                            <Button type="submit" className="formButton" variant="danger" onClick={handleUnlistEvent} style={{ marginLeft: '10px'}}>{isDeleting ? <BarLoader color="#FFFFFF" height={4} width={50} /> : "Unlist Event"}</Button>
                                        ) : (
                                            <Button type="submit" className="formButton" variant="primary" onClick={handleRelistEvent} style={{marginLeft: '10px'}}>{isDeleting ? <BarLoader color="#FFFFFF" height={4} width={50} /> : "Relist Event"}</Button>
                                        )}
                                        
                                    </div>
                                ) : (
                                    <Button>
                                        <div className="create-event">
                                            <Button type="submit" className="formButton" onClick={handleEvent}>{isSubmitting ? <BarLoader color="#FFFFFF" height={4} width={50} /> : "List Event"}</Button>
                                        </div>
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </Container>
                    

                </div>
            </div>
        )
    } else {
        if (loading) {
            return <ClipLoader />
        }
        if (userId) {
            return (
                <div>
                    <div className="id-mismatch">
                        <h1>Unauthorized Access</h1>
                        <hr />
                        <Row><h3>Sorry, you don't have access to this form. Are you logged into the correct account?</h3></Row>
                        <Button href="/form" style={{ marginTop: "1rem", justifyItems: "center" }}>Click here to start creating a new event!</Button>
                    </div>
                </div>
            )
        } else if (!userLoggedIn) {
            return (
                <div>
                    <div className="id-mismatch">
                        <h1>Ready to make an event?</h1>
                        <hr />
                        <Button href="/login" style={{ marginTop: "1rem", justifyItems: "center" }}>Click here to login to your account and get started!</Button>
                    </div>
                </div>
            )
        }
    }
}

export default EventForm