import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Col, Row, Button, Card, Pagination } from "react-bootstrap";
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { ClipLoader } from "react-spinners";
import EventRow from "../components/EventRow";
import "../styles/Events.css";
import { getBackendURL, getEventOwner } from "../Utils";
import Select from 'react-select';
import axios from "axios";
import moment from "moment/moment";
import Title from "../components/Title";

const Events = () => {

    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("")
    const [loading, setLoading] = useState(true);
    const [instruments, setInstruments] = useState([])
    const [selectedInstruments, setSelectedInstruments] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState("date_posted_asc");
    const [deviceType, setDeviceType] = useState("browser");
    const countPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        try {
            //fetch all events from server
            axios.get(`${getBackendURL()}/event`).then((res) => {
                const data = res.data;
                //Filter out all events from data whose is_listed is false
                const filteredData = data.filter(event => event.is_listed === true || event.is_listed === 1)
                setEvents(filteredData);
                sortEvents(filteredData);
                //setting this for managing what data is currently being filtered
                setFilteredEvents(filteredData);
                setLoading(false);

                //fetch instruments needed for tags
                axios.get(`${getBackendURL()}/instrument/`).then((res) => {
                    const data = res.data;

                    //Create instruments
                    setInstruments(configureInstrumentList(data));
                });

            //Update device type
            updateDeviceType();
            window.addEventListener("resize", updateDeviceType); 
            });
        } catch (err) {
            console.log(err)
        }
    }, [])

    const updateDeviceType = () => {
        if (window.innerWidth >= 992) setDeviceType("browser");
        else setDeviceType("mobile");
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const goToEvent = (event_id) => {
        navigate(`/event/${event_id}`)
    }

    const setDate = (e) => {
        setStartDate(e.target.value);
        if (!(endDate && endDate > startDate)) setEndDate(e.target.value);
    }

    const sortEvents = (events) => {
        switch (sort)
        {
            //Date Posted (Most recent -> Least Recent) (Default)
            case "date_posted_asc": events.sort((a, b) => {return moment(b.date_posted).subtract(moment(a.date_posted))}); break;
            //Date Posted (Least recent -> Most Recent)
            case "date_posted_dsc": events.sort((a, b) => {return moment(a.date_posted).subtract(moment(b.date_posted))}); break;
            //Name (A->Z)
            case "event_name_asc": events.sort((a, b) => {return a.event_name.toLowerCase().charCodeAt(0) - b.event_name.toLowerCase().charCodeAt(0)}); break;
            //Name (Z->A)
            case "event_name_dsc": events.sort((a, b) => {return b.event_name.toLowerCase().charCodeAt(0) - a.event_name.toLowerCase().charCodeAt(0)}); break;
            //Date (Soonest -> Latest)
            case "start_time_asc": events.sort((a, b) => {return moment(a.start_time).subtract(moment(b.end_time))}); break;
            //Date (Latest -> Soonest)
            case "start_time_dsc": events.sort((a, b) => {return moment(b.start_time).subtract(moment(a.end_time))}); break;
            //Price (Lowest -> Highest)
            case "pay_asc": events.sort((a, b) => {return a.pay - b.pay}); break;
            //Price (Highest -> Lowest)
            case "pay_dsc": events.sort((a, b) => {return b.pay - a.pay}); break;
        }
        return events;
    }

    const handleSearch = (event) => {
        event.preventDefault();
        let filteredEvents = events.filter(event => {
            const owner = getEventOwner(event);
            const eventDate = moment(event.start_time);
            const eventInstruments = event.Instruments ? event.Instruments.map(instrument => instrument.name.toLowerCase()) : [];
            const containsSearchQuery = !searchQuery || event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) || owner.f_name.toLowerCase().includes(searchQuery.toLowerCase()) || owner.l_name.toLowerCase().includes(searchQuery.toLowerCase());
            const isInDateRange = startDate ? eventDate.isSameOrAfter(moment(startDate)) && eventDate.isSameOrBefore(moment(endDate)) : true;
            const matchesSelectedInstruments = selectedInstruments.length === 0 || selectedInstruments.some(selected => eventInstruments.includes(selected.value.toLowerCase()))

            return containsSearchQuery && isInDateRange && matchesSelectedInstruments;
        });
        setCurrentPage(1);

        //Sort by...
        filteredEvents = sortEvents(filteredEvents);
        setFilteredEvents(filteredEvents);
    };

    //Configure instrument list (to work with special select)
    const configureInstrumentList = (data) => {
        const instrumentOptionList = []
        data.forEach(instrument => {
            instrumentOptionList.push({value: instrument.name, label: instrument.name});
        });
        return instrumentOptionList
    }

    const getHeader = () => {
        if (deviceType === "browser")
        {
            return (
                <Row>
                    <Col lg={1}><h5>Date</h5></Col>
                    <Col lg={2}><h5>Event Name</h5></Col>
                    <Col lg={1}><h5>Pay</h5></Col>
                    <Col lg={2}><h5>Instruments</h5></Col>
                    <Col lg={2}><h5>Organizer</h5></Col>
                    <Col lg={3}><h5>Address</h5></Col>
                    <Col lg={1}></Col>
                </Row>
            )
        }
        else {
            return (
                <Row>
                    <Col><h4>Events</h4></Col>
                </Row>
            )
        }
    }



    return (
        <div>
            <Title title={"Events"} />
            <hr />
            <Container style={{ textAlign: "left" }}>
                <Form onSubmit={handleSearch}>
                    <Row className="mb-3">
                        <Col lg="2" className="mb-2">
                            <Form.Label>Search by name</Form.Label>
                            <Form.Control type="text" placeholder="Ex. Bar Gig" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </Col>
                        <Col lg="3" className="mb-2">
                            <Form.Label>Search by Instrument</Form.Label>
                            <Select placeholder="Ex. Piano" options={instruments} isMulti onChange={(selectedOptions) => setSelectedInstruments(selectedOptions)} value={selectedInstruments} required={false}></Select>
                        </Col>
                        <Col lg="4" className="mb-2">
                            <Form.Label>Date Range</Form.Label>
                            <Row>
                                <Col lg="6" sm={6} xs={6}><Form.Control type="date" placeholder="Start Date" value={startDate} onChange={(e) => setDate(e)} /></Col>
                                <Col lg="6" sm={6} xs={6}><Form.Control type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate}/></Col>
                            </Row>
                        </Col>
                        <Col lg="2" className="mb-2">
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select value={sort} onChange={(e) => {setSort(e.target.value)}}>
                                <option value={"date_posted_asc"}>Date Posted (↓)</option>
                                <option value={"date_posted_dsc"}>Date Posted (↑)</option>
                                <option value={"pay_asc"}>{`Pay ($→$$$)`}</option>
                                <option value={"pay_dsc"}>{`Pay ($$$→$)`}</option>
                                <option value={"event_name_asc"}>{`Name (A→Z)`}</option>
                                <option value={"event_name_dsc"}>{`Name (Z→A)`}</option>
                                <option value={"start_time_asc"}>Date (↓)</option>
                                <option value={"start_time_dsc"}>Date (↑)</option>
                            </Form.Select>
                        </Col>
                        <Col lg="1" className="align-self-end justify-content-end" >
                            <Button variant="primary" type="submit">Search</Button>
                        </Col>
                    </Row>
                </Form>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center" }}><ClipLoader /></div>
                ) : (
                    <Card>
                        <Col>
                            <Card.Header>{getHeader()}</Card.Header>
                            {filteredEvents.slice((currentPage-1)*countPerPage, (currentPage-1)*countPerPage+countPerPage).map((event, index) => (
                                <EventRow key={event.event_id} index={index} event={event} goToEvent={goToEvent} formatDate={formatDate} deviceType={deviceType}/>
                            ))}
                            {filteredEvents.length <= 0 && <Row className="my-4" style={{textAlign: "center"}}><h4>No events found.</h4></Row>}
                        </Col>
                        <Row className="my-2">
                            <PaginationControl page={currentPage} total={filteredEvents.length} limit={countPerPage} changePage={(page) => {setCurrentPage(page)}} ellipsis={1}/>
                        </Row>
                    </Card>
                )}


            </Container>
        </div>
    )
}

export default Events