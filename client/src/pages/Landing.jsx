import React, { useRef } from "react";
import { useEffect, useState} from "react";
import { Link, Router } from "react-router-dom";
import { Container, Row, Col, CardGroup, Button, Carousel } from "react-bootstrap";
import axios from "axios";
import EventHorizontalScroll from "../components/EventHorizontalScroll";
import { ClipLoader } from "react-spinners";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { getBackendURL, getEventOwner, toastError, toastInfo, toastSuccess } from "../Utils"
import Title from "../components/Title";

function Landing() {
    //Varaibles
    const recentNum = 10;
    const relevantNum = 10;

    //Account
    const [cookies, , removeCookie] = useCookies([]);
    const [user, setUser] = useState(false);

    //State Variables
    const [getRecent, setGetRecent] = useState(false);
    const [recentEvents, setRecentEvents] = useState()
    const [relevantEvents, setRelevantEvents] = useState();
    const [userEvents, setUserEvents] = useState();
    const [isLoading, setIsLoading] = useState(true);

    //Get recent event on first load
    useEffect(() => {
        if (cookies.jwt)
        {
            try
            {
                //Get user
                axios.get(`${getBackendURL()}/account`, {withCredentials: true}).then(async res => {
                    //Get data based on user
                    if (res.data?.user)
                    {
                        //Get user data
                        axios.get(`${getBackendURL()}/user/id/${res.data?.user.user_id}`, { withCredentials: true }).then(async res => {
                            const userData = res.data;
                            if (userData)
                            {
                                
                                setUser(userData);

                                //Set user events
                                const userEventList = [];
                                userData.Events.forEach(event => {
                                    if (event.UserStatus.status == "owner" && event.is_listed)
                                    {
                                        userEventList.push(event);
                                    }
                                });
                                if (userEventList.length > 0) setUserEvents(userEventList);

                                //Get list of instrument ids
                                const instruments = userData.Instruments;
                                let instrumentSearch = [];
                                instruments.forEach(instrument => {
                                    instrumentSearch.push(instrument.instrument_id);
                                })

                                //Get event data
                                if (instrumentSearch.length > 0)
                                {
                                    axios.get(`${getBackendURL()}/event/instrument/${instrumentSearch.join("|")}?sort=true&limit=${30}`).then(res => {
                                        //Filter out our events
                                        const data = res.data;
                                        if (data && data?.length > 0)
                                        {
                                            const instrumentEventSearch = data.filter(event => {
                                                return getEventOwner(event)?.user_id != userData?.user_id
                                            });
                                            
                                            //Get list of locations
                                            const zipList = [];
                                            instrumentEventSearch.forEach(event => {
                                                zipList.push(event.Address.zip);
                                            });

                                            if (zipList.length > 0)
                                            {
                                                //Sort by location
                                                axios.get(`${getBackendURL()}/api/distance_matrix/${userData.zip}/${zipList.join("|")}`).then(res => {
                                                    const distanceMatrixData = res.data.rows[0].elements;
                                                    //Add to data
                                                    for (let i = 0; i < instrumentEventSearch.length; i++)
                                                    {
                                                        if (distanceMatrixData[i].status == "OK" && distanceMatrixData[i].distance)
                                                        {
                                                            instrumentEventSearch[i]["distance"] = distanceMatrixData[i].distance.value;
                                                        }
                                                        else 
                                                        {
                                                            instrumentEventSearch[i]["distance"] = 9999;
                                                        }
                                                    }
                                                    
                                                    //Sort
                                                    instrumentEventSearch.sort((a, b) => a.distance - b.distance);
                                                    console.log("Got Relevant");
                                                    setRelevantEvents(instrumentEventSearch.slice(0, Math.min(relevantNum, instrumentEventSearch.length)));
                                                    setIsLoading(false);
                                                })
                                            }
                                            else setGetRecent(true);
                                        }
                                        else setGetRecent(true);
                                    })
                                }
                                else setGetRecent(true);
                            }
                        })              
                    }
                    else setGetRecent(true);
                });   
            }
            catch (error)
            {
                console.log(error);
                toast("An error occured loading event data.", toastError);
                setGetRecent(true); //Try to get recent events
            }
        }
        else
        {
            setGetRecent(true); 
        }
    }, [])

    //Get recent events
    useEffect(() => {
        if (getRecent)
        {
            //Get non-logged in data
            axios.get(`${getBackendURL()}/event/recent/${recentNum}`).then(res => {
                let recentEvents = res.data;
                if (user)
                {
                    recentEvents = res.data.filter((event) => {
                        return getEventOwner(event)?.user_id != user?.user_id;
                    });
                }
                
                setRecentEvents(recentEvents);
                setIsLoading(false);
                setGetRecent(false);
                console.log("Got recent");
            }).catch(error => {
                console.log(error);
                toast("An error occured loading event data.", toastError)
                setIsLoading(false);
            });
        }
    }, [getRecent])

    //Get layout based on logged in status
    function getLayout()
    {
        //If logged in
        if (cookies.jwt || user)
        {
            return (
                <>
                <h2>Events For You</h2>
                <br />
                <br />
                {isLoading ? <ClipLoader /> : <EventHorizontalScroll data={relevantEvents ? relevantEvents : recentEvents} persistantArrows={true}/>}
                <br />
                <Button variant='secondary' href="/eventsearch">View all events</Button>
                <hr />
                <h2>Your Listed Events</h2>
                <br />
                <br />
                {isLoading ? <ClipLoader /> : userEvents ? <EventHorizontalScroll data={userEvents} persistantArrows={true}/> : <Button variant='primary' href="/form">Create an event!</Button>}
                <br />
                <br />
                {isLoading ? null : userEvents && <Button variant='secondary' href="/login">Manage Events</Button>}
                </>
            )
        }
        else
        {
            return (
                <>
                <h2>Recently Added Events</h2>
                <br />
                <br />
                {isLoading ? <ClipLoader /> : <EventHorizontalScroll data={recentEvents} persistantArrows={true}/>}
                <br />
                <hr />
                <h2>Your Listed Events</h2>
                <br />
                <br />
                {!isLoading && <Button variant='primary' href="/account">Login/Register now to create events!</Button>}
                </>
            )
        }
    }

    //Loading
    return (
        <div>
            <Title title="Home"/>
            <Container>
                <Row>
                    <Col xl={5} lg={4} md={4} className={"text-lg-end text-md-end text-sm-center"}>
                        <img src={require('../img/logo-circle.png')} height={200}></img>
                    </Col>
                    <Col className="my-auto text-lg-start text-md-start text-sm-middle">
                        <h1>Harmonize</h1>
                        <br />
                        <h3>Connecting musicians and organizers.</h3>
                    </Col>
                </Row>
                {/* 
                <Carousel interval={1000}>
                    <Carousel.Item>
                    <img width={"100%"} height={"100px"} src="https://media.istockphoto.com/id/1221351454/photo/portrait-of-a-japanese-guitar-player-at-home-studio.jpg?s=612x612&w=0&k=20&c=egLdt2l-RGUxBzdLLMeK1WHpZ9hFnUdfUHUsvfAIcXg="></img>
                    <Carousel.Caption>Test</Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                    <img src="https://www.shutterstock.com/image-photo/man-musical-art-concept-260nw-410543464.jpg"></img>
                    </Carousel.Item>
                </Carousel>
                */}
                
                <Container>
                    <br />
                    <hr />
                    {getLayout()}
                    <br />
                </Container>
            </Container>
        </div>
    )
}

export default Landing