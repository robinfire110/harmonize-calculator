import React from "react";
import { useEffect, useState } from "react";
import { Link, redirect, useNavigate, useParams} from "react-router-dom";
import { Container, Form, Col, Row, InputGroup, Button, Modal, Alert, OverlayTrigger, Card, ButtonGroup, ToggleButton, Popover } from "react-bootstrap";
import moment from "moment";
import SimpleBar from 'simplebar-react';
import TooltipButton from "../components/TooltipButton";
import FormNumber from "../components/FormNumber";
import axios from "axios";
import {BarLoader, ClipLoader} from 'react-spinners'
import {DATA_VALUE, formatCurrency, formatMoneyVars, maxFinancialNameLength, metersToMiles, parseBool, parseFloatZero, parseIntZero, parseStringUndefined, saveSpreadsheet, toastError, toastInfo, toastSuccess} from "../Utils";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import {getBackendURL} from "../Utils";
import Title from "../components/Title";
import CalculatorInput from "../components/CalculatorInput";
import GigOptionsModal from "../components/GigOptionsModal";
import TripNumber from "../components/TripNumber";
import {useJsApiLoader} from '@react-google-maps/api';

const Calculator = () => {
    /* Variables */
    //Account
    const [cookies, , removeCookie] = useCookies([]);
    const [user, setUser] = useState();
    const [userFinancials, setUserFinancials] = useState();
    const [searchQuery, setSearchQuery] = useState("");

    //Params
    const navigate = useNavigate();
    const [paramId, setParamId] = useState(useParams().id);
    const [finId, setFinId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [currentState, setCurrentState] = useState("average_gas");
    const [currentVehicle, setCurrentVehicle] = useState("average_mpg");
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [gasModalOpen, setGasModalOpen] = useState(false);
    const [gigNumModalOpen, setGigNumModalOpen] = useState(false);

    //States
    //Variables
    const [formData, setFormData] = useState({
        fin_name: "",
        date: moment().format("YYYY-MM-DD"),
        event_num: null,
        total_wage: null,
        event_hours: null,
        hourly_wage: null,
        practice_hours: null,
        rehearsal_hours: null,
        travel_hours: null,
        total_mileage: null,
        mileage_covered: null,
        trip_num: 2,
        travel_fees: null,
        zip: null,
        gas_price: null,
        mpg: null,
        tax: null,
        fees: null,
        multiply_pay: true,
        multiply_hours: true,
        multiply_travel: true,
        multiply_practice: false,
        multiply_rehearsal: false,
        multiply_other: false,
    });

    //Load Google Maps
    const {mapsAPILoaded} = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_API_GOOGLE_MAPS
    });

    function setFormDataValue(variable, value, type=null)
    {
        //Parse value (if needed)
        switch (type)
        {
            case DATA_VALUE.INT: value = parseIntZero(value); break;
            case DATA_VALUE.FLOAT: value = parseFloatZero(value); break;
            case DATA_VALUE.STRING: value = parseStringUndefined(value); break;
        }
        setFormData({...formData, [variable]: value});
    }

    //Enable
    const [formEnabled, setFormEnabled] = useState({
        event_num: false,
        total_mileage: false,
        travel_hours: false,
        mileage_covered: false,
        travel_fees: false,
        practice_hours: false,
        rehearsal_hours: false,
        tax: false,
        fees: false
    });
    function setFormEnabledValue(variable, value)
    {
        setFormEnabled({...formEnabled, [variable]: value});
    }

    //Totals for calculator
    const [totalOtherFees, setTotalOtherFees] = useState();
    const [totalTravel, setTotalTravel] = useState(0.0); 
    const [totalTax, setTotalTax] = useState(0.0); 
    const [totalHours, setTotalHours] = useState(0.0);
    const [totalPay, setTotalPay] = useState(0);
    const [hourlyWage, setHourlyWage] = useState(0.0);
    
    //Other Variables
    const [gasPrices, setGasPrices] = useState();
    const [modalOriginZip, setModalOriginZip] = useState("");
    const [modalDestinationZip, setModalDestinationZip] = useState("");
    const [nameLength, setNameLength] = useState(maxFinancialNameLength);
    const [tripNumSelect, setTripNumSelect] = useState(1);
    const [customTripNum, setCustomTripNum] = useState();
    const [gasPricePerMile, setGasPricePerMile] = useState();
    const [saveStatus, setSaveStatus] = useState(false);

    /* Effect */
    //On first load
    useEffect(() => {
        //Check for paramId
        if (paramId && !cookies.jwt) navigate("/");

        //Get Gas Prices
        if (!gasPrices)
        {
            axios.get(`${getBackendURL()}/gas`).then(res => {
                let map = {};
                for (let i = 0; i < res.data.length; i++)
                {
                    map[res.data[i].location] = res.data[i].average_price;
                }   
                setGasPrices(map);
                setAverageGasPrice(map);
            }).catch((error) => {
                console.log(error);
                setGasPrices(undefined);
            });
        }
    }, []);

    //Load user (after gas price load)
    useEffect(() => {
        //Get user
        if (cookies.jwt && gasPrices)
        {
            axios.get(`${getBackendURL()}/account`, {withCredentials: true}).then(res => {
                if (res.data?.user)
                {
                    axios.get(`${getBackendURL()}/user/id/${res.data.user.user_id}`, { withCredentials: true }).then(res => {
                        const userData = res.data;
                        loadData(userData);
                        setUser(userData);
                    });  
                }
                else 
                {
                    setUser(undefined);
                }
            }).catch((error) => {
                console.log(error);
                removeCookie("jwt");
            });
        }
    }, [gasPrices]);

    //Load from database
    useEffect(() => {
        if (cookies.jwt)
        {
            if (user)
            {
                getSavedFinancials();
                if (paramId)
                {
                    loadFromDatabase(user).then(() => {
                        setIsLoading(false);
                    });
                }
                else setIsLoading(false);
            }
        }
        else
        {
            setIsLoading(false);
        }
    }, [user])
    
    //Runs when any fields related to calculation updates.
    useEffect(() => {
        //Calculate Wage
        calculateHourlyWage();
        
    }, [formData, formEnabled, gasPricePerMile])

    //Runs when any fields related to gas price calcuation updates.
    useEffect(() => {
        calculateGasPerMile();
    }, [formData.gas_price, formData.mpg])

    //Update name length
    useEffect(() => {
        const nameBox = document.getElementById("fin_name");
        if (nameBox)
        {
            setNameLength(maxFinancialNameLength-nameBox.value.length);
        } 
    }, [formData.fin_name]);

    //Search
    useEffect(() => {
        getSavedFinancials();
    }, [searchQuery]);

    //Load data
    function loadData(data)
    {
        //Set data
        const newData = {...data};
        
        //Filter unneeded
        const defaultState = newData?.default_state;
        const defaultVehicle = newData?.default_vehicle;
        const filterVars = ["user_id", "email", "isAdmin", "Users", "Financials", "fin_id", "default_state", "default_vehicle"];
        filterVars.forEach(element => {
            if (newData[element]) delete newData[element];
        });

        //Filter (so you don't have zeros everywhere)
        const nullVars = Object.keys(data);
        nullVars.forEach(element => {
            if (!element.includes("multiply") && data[element] <= 0 || data[element] === "") newData[element] = null;
        });

        //Decimals (monetary fields load with 2 decimal places)
        formatMoneyVars(newData);
        /*
        const moneyVars = ["total_wage", "gas_price", "mileage_covered", "travel_fees", "fees"]
        moneyVars.forEach(element => {
            const value = newData[element];
            if (value) newData[element] = value.toFixed(2);
        });
        */
        
        //Set gas prices
        if (defaultState)
        {
            if (defaultState !== "custom")
            {
                newData.gas_price = Math.round(gasPrices[defaultState] * 100) / 100;
                setCurrentState(defaultState);
            } 
        }
        
        if (defaultVehicle)
        {
            if (defaultVehicle !== "custom")
            {
                newData.mpg = gasPrices[defaultVehicle];
                setCurrentVehicle(defaultVehicle);
            } 
        }

        //Set Form Data
        setFormData({...formData, ...newData});

        //Set switches
        setFormEnabled({...formEnabled, event_num: newData?.event_num > 0, total_mileage: newData?.total_mileage > 0, travel_hours: newData?.travel_hours > 0, mileage_covered: newData?.mileage_covered > 0, travel_fees: newData?.travel_fees > 0, practice_hours: newData?.practice_hours > 0, rehearsal_hours: newData?.rehearsal_hours > 0, tax: newData?.tax > 0, fees: newData?.fees > 0})
        if (newData?.zip) setModalOriginZip(newData?.zip);

        //Set Trip Num
        setTripNumSelect(Math.min(2, newData.trip_num-1));
        if (newData.trip_num > 2) setCustomTripNum(newData?.trip_num);
        else setCustomTripNum(null);
    }

    //Load from database (both fin_id)
    async function loadFromDatabase(currentUser=user, finId=paramId)
    {
        //Get data
        await axios.get(`${getBackendURL()}/financial/user_id/fin_id/${currentUser?.user_id}/${finId}`, {withCredentials: true}).then(res => {
            const data = res.data[0];
            if (data && data?.fin_id) setFinId(data.fin_id);

            //Financial exists!
            if (data) loadData(data);
            else //Financial does not exists, redirect to blank page.
            {
                setParamId(null);
                navigate(`/`); 
                toast("You do not have access to this data.", toastError)
            }
        });
    }
    
    async function calculateBasedOnLocation(originZip, destinationZip)
    {
        if (!isGettingLocation)
        {
            setIsGettingLocation(true);
            const service = new window.google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [originZip],
                destinations: [destinationZip],
                travelMode: "DRIVING"
            }, (data, status) => {
                console.log(data, status);
                if (status === "OK" && data.rows[0].elements[0].status == "OK")
                {
                    const distance = data.rows[0].elements[0].distance.value;
                    const duration = data.rows[0].elements[0].duration.value;
                    const distanceInMiles = metersToMiles(distance).toFixed(2);
                    const durationInHours = ((duration/60)/60).toFixed(2);
                    setFormEnabled({...formEnabled, total_mileage: true, travel_hours: true});
                    setFormData({...formData, total_mileage: distanceInMiles, travel_hours: durationInHours, zip: destinationZip});
                    setLocationModalOpen(false);
                    setIsGettingLocation(false);
                }
                else
                {
                    //Signal Modal If Something Wrong
                    toast("An error occured, please ensure zip codes are correct.", toastError);
                    setIsGettingLocation(false);
                }
            });
        }
    }

    //Get Zip Codes from Modal
    async function getZipCodes()
    {
        //Get elements
        const elementOriginZip = document.getElementById("modalOriginZip");
        const elementDestinationZip = document.getElementById("modalDestinationZip");
        if (modalOriginZip.length == 5 && modalDestinationZip.length == 5)
        {
            calculateBasedOnLocation(modalOriginZip, modalDestinationZip);
        }
        else
        {
            if (modalOriginZip.length != 5) elementOriginZip.setCustomValidity("Zip code must be 5 numbers (#####).");
            else if (modalDestinationZip.length != 5) elementDestinationZip.setCustomValidity("Zip code must be 5 numbers (#####).");
            setIsGettingLocation(false);
        }
    }

    //Calculate wage
    function calculateHourlyWage() 
    {
        let wage = 0;
        let finalPay = 0;

        //Set multiples
        let gigHoursNum = formEnabled.event_num && formData.event_num && formData.multiply_hours ? parseFloat(formData.event_num) : 1;
        let practiceHoursNum = formEnabled.event_num && formData.event_num && formData.multiply_practice ? parseFloat(formData.event_num) : 1;
        let rehearsalHoursNum = formEnabled.event_num && formData.event_num && formData.multiply_rehearsal ? parseFloat(formData.event_num) : 1;
        let travelNum = formEnabled.event_num && formData.event_num && formData.multiply_travel? parseFloat(formData.event_num) : 1;
        let otherFeesNum = formEnabled.event_num && formData.event_num && formData.multiply_other? parseFloat(formData.event_num) : 1;

        //Calculate possible income
        if (formData.total_wage) wage = parseFloat(formData.total_wage);
        if (formEnabled.event_num && formData.event_num && formData.multiply_pay) wage *= parseInt(formData.event_num);

        //Calculate tax (if needed)
        if (formEnabled.tax)
        {  
            let currentTax = 0;
            if (formData.tax) currentTax = wage * (parseFloat(formData.tax)/100);
            setTotalTax(currentTax);
            wage -= currentTax;
        } 

        //Calculate mileage pay
        let totalTravelCosts = 0;
        let gasPrice = 0;
        let totalTravelFees = 0;

        if (formEnabled.travel_fees && formData.travel_fees)
        {
            totalTravelFees = parseFloatZero(formData.travel_fees);
        }

        if (formEnabled.total_mileage && formData.total_mileage && gasPricePerMile)
        {
            gasPrice = parseFloat(gasPricePerMile);
            //Subtract mileage covered
            if (formEnabled.mileage_covered && formData.mileage_covered) gasPrice -= parseFloat(formData.mileage_covered);
            gasPrice = parseFloat(formData.total_mileage) * parseIntZero(formData.trip_num) * gasPrice;
        }

        if (!(gasPrice == 0 && totalTravelFees == 0))
        {
            totalTravelCosts = (gasPrice+totalTravelFees) * travelNum;
            setTotalTravel(totalTravelCosts);
            wage -= totalTravelCosts;
        }
        
        //Other fees (if needed)
        if (formEnabled.fees && formData.fees)
        {
            let fees = parseFloat(formData.fees) * (otherFeesNum);
            setTotalOtherFees(fees)
            wage -= fees;
        } 

        //Calculate hours
        let hours = 0;
        
        if (formData.event_hours) hours = parseFloatZero(formData.event_hours) * gigHoursNum;
        if (formEnabled.practice_hours && formData.practice_hours) hours += parseFloatZero(formData.practice_hours) * practiceHoursNum;
        if (formEnabled.rehearsal_hours && formData.rehearsal_hours) hours += parseFloatZero(formData.rehearsal_hours) * rehearsalHoursNum;
        if (formEnabled.travel_hours && formData.travel_hours) hours += parseFloatZero(formData.travel_hours) * travelNum * parseIntZero(formData.trip_num);
        setTotalHours(hours.toFixed(2));

        //Final division
        setTotalPay(wage);
        if (hours > 0) finalPay = wage/hours;
        if (!formData.total_wage) finalPay = 0;
        
        //Convert
        setHourlyWage(finalPay);
    }

    //Calculate gas per mile
    function calculateGasPerMile() 
    {
        if (formData.gas_price && formData.mpg)
        {
            //Set
            let value = (formData.gas_price/formData.mpg).toFixed(2);
            setGasPricePerMile(value);
        }
        else
        {
            setGasPricePerMile("");
        }
    }

    //Set average gas price
    function setAverageGasPrice(dataOverride=undefined, state=currentState, vehicle=currentVehicle)
    {
        //Data
        let data = gasPrices;
        if (dataOverride) data = dataOverride;
        console.log(currentState, currentVehicle);

        //Set data
        if (data)
        {
            /* Check if login, use local state. Else, use default. */
            setFormData({...formData, gas_price: Math.round(data[state] * 100) / 100, mpg: data[vehicle]})
            setGasModalOpen(false);
        }
    }

    async function saveFinancial(spreadsheet)
    {
        if (!saveStatus)
        {
            //Set data
            //I do it manually to check for enabled/disable and parse the data correctly (i.e. no null or undefined values)
            const data = {
                fin_name: parseStringUndefined(formData.fin_name),
                date: moment(formData.date).format("YYYY-MM-DD"),
                total_wage: parseFloatZero(formData.total_wage),
                event_hours: parseFloatZero(formData.event_hours),
                event_num: formEnabled.event_num ? parseIntZero(formData.event_num) : 0,
                hourly_wage: parseFloatZero(hourlyWage),
                practice_hours: formEnabled.practice_hours ? parseFloatZero(formData.practice_hours) : 0,
                rehearsal_hours: formEnabled.rehearsal_hours ? parseFloatZero(formData.rehearsal_hours) : 0,
                travel_hours: formEnabled.travel_hours ? parseFloatZero(formData.travel_hours) : 0,
                total_mileage: formEnabled.total_mileage ? parseFloatZero(formData.total_mileage) : 0,
                trip_num: parseIntZero(formData.trip_num),
                travel_fees: formEnabled.travel_fees ? parseFloatZero(formData.travel_fees) : 0,
                mileage_covered: formEnabled.mileage_covered ? parseFloatZero(formData.mileage_covered) : 0,
                zip: parseStringUndefined(formData.zip),
                gas_price: parseFloatZero(formData.gas_price),
                mpg: parseFloatZero(formData.mpg),
                tax: formEnabled.tax ? parseFloatZero(formData.tax) : 0,
                fees: formEnabled.fees ? parseFloatZero(formData.fees) : 0,
                multiply_pay: parseBool(formData.multiply_pay),
                multiply_hours: parseBool(formData.multiply_hours),
                multiply_travel: parseBool(formData.multiply_travel),
                multiply_practice: parseBool(formData.multiply_practice),
                multiply_rehearsal: parseBool(formData.multiply_rehearsal),
                multiply_other: parseBool(formData.multiply_other)
            }
            console.log("Submit", data);
            
            //Check validity (will return false if not valid, HTML will take care of the rest).
            const inputs = document.getElementById("calculatorForm").elements;
            for (let i = 0; i < inputs.length; i++) {
                if (!inputs[i].disabled && !inputs[i].checkValidity())
                {
                    inputs[i].reportValidity();
                    console.log("NOT VALID");
                    return false
                } 
            }

            //Check other validity
            //Trip Number
            if (formData.trip_num <= 0)
            {
                let tripNumBox = document.getElementById('formData.trip_num');
                tripNumBox.setCustomValidity("Value must be greater than 0.");
            }

            //Save (in correct place)
            if (!spreadsheet)
            {
                //Set save status
                setSaveStatus(true);

                //Save to database
                if (paramId) //If exists, update
                {
                    console.log(`UPDATE ${finId} ${paramId}`, data)
                    await axios.put(`${getBackendURL()}/financial/${finId}`, data, {withCredentials: true}).then(res => {
                        toast("Calculator data updated sucessfuly", toastSuccess);
                        setSaveStatus(false);

                        //Update user
                        const updatedFin = res.data
                        let currentUser = user;
                        let updateIndex = -1;
                        for (let i = 0; i < currentUser.Financials.length; i++)
                        {
                            if (updatedFin.fin_id == currentUser.Financials[i].fin_id)
                            {
                                updateIndex = i;
                                break;  
                            }
                        }
                        if (updateIndex != -1)
                        {
                            currentUser.Financials[updateIndex] = updatedFin;
                            setUser(currentUser);
                            getSavedFinancials(currentUser);
                        }
                        
                        
                    }).catch(error => {
                        toast("An error occured while updating. Please ensure all fields are filled out correctly and try again.", toastError);
                        setSaveStatus(false);
                        console.log(error);
                    });
                }
                else //If new, post.
                {
                    await axios.post(`${getBackendURL()}/financial/${user?.user_id}`, data, {withCredentials: true}).then(res => {
                        //SetID
                        setParamId(res.data.fin_id);
                        setFinId(res.data.fin_id);

                        //Update URL
                        navigate(`/calculator/${res.data.fin_id}`);
                        toast("Calculator data saved sucessfuly", toastSuccess);
                        setSaveStatus(false);

                        //Update user
                        let newUser = user;
                        newUser.Financials.push(res.data);
                        setUser(newUser);
                        getSavedFinancials(newUser, res.data.fin_id); 
                    }).catch(error => {
                        toast("An error occured while saving. Please ensure all fields are filled out correctly and try again.", toastError);
                        setSaveStatus(false);
                        console.log(error);
                    });
                };
            }
            else
            {
                saveSpreadsheet(formData);
            }
        }
    }

    //Get saved financials
    function getSavedFinancials(userData=user, finId=paramId)
    {
        if (userData)
        {
            //Search
            const filtered = userData.Financials.filter(financial => {
                return financial.fin_name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            //Sort
            const sorted = filtered.sort((a, b) => {
                if (a.fin_name > b.fin_name) return 1;
                return -1;
            });

            //Apply
            const financials = sorted.map((fin, index) =>
                <Row className="my-1 py-1" style={{backgroundColor: `rgba(100,100,100,${.15+(index % 2 * .15)}`, borderRadius: "3px", verticalAlign: "middle"}} key={fin.fin_id}>
                    <Col className="mt-1"><h6>{fin.fin_name}</h6></Col>
                    <Col className='text-center' lg={3} md={3} sm={3} xs={3}><Button variant={fin.fin_id==finId ? "dark" : "secondary"} size="sm" disabled={fin.fin_id==finId} href={`/calculator/${fin.fin_id}`}>{fin.fin_id==finId ? "Loaded" : "Load"}</Button></Col>
                </Row>
            );
            if (financials.length > 0) setUserFinancials(financials);
            else setUserFinancials(<Row>No Financials</Row>);
        }
        else
        {
            setUserFinancials(<Row>No Financials</Row>);
        }
    }

    if (isLoading)
    {
        return (
            <div>
                <ClipLoader />
            </div>
        )
    }
    else
    {
    return (
        <div>
            <Title/>
            <div>
            <h2>Harmonize Calculator</h2>
            <h5>The quick and easy way to calculate, save and manage gig financials</h5>
            </div>
            <hr />
            <Container className="" style={{textAlign: "left"}}>   
            <Form id="calculatorForm" onSubmit={e => e.preventDefault()}>
                <Row>
                    {/* Column 1: Calculator */}
                    <Col xl={8} lg={7}>
                        <Row>
                            <Container id="basicInfoBox">
                                <h3>Basic Information</h3>
                                <hr />
                            </Container>
                        </Row>
                            <Form.Group>
                                <Row className="mb-3">
                                    <Col xs={7} sm={8}>
                                        <Form.Label style={{width: '100%'}}>
                                            <Row>
                                                <Col>Name<span style={{color: "red"}}>*</span></Col>
                                                <Col className="text-end">{nameLength}/{maxFinancialNameLength}</Col>
                                            </Row>
                                        </Form.Label>
                                        <Form.Control id="fin_name" value={formData.fin_name || ""} type="text" maxLength={maxFinancialNameLength} required={true} placeholder="Calculation Name" onChange={e => setFormDataValue("fin_name", e.target.value, DATA_VALUE.STRING)} pattern={`[a-zA-Z0-9\\s.'"-!,]+`}></Form.Control>
                                    </Col>
                                    <Col xs={5} sm={4}>
                                        <Form.Label>Date<span style={{color: "red"}}>*</span></Form.Label>
                                        <Form.Control id="date" value={formData.date || ""} type="date" required={true} onChange={e => setFormDataValue("date", e.target.value, DATA_VALUE.STRING)}></Form.Control>
                                    </Col>
                                </Row>
                                <Row className="mb-3" xs={1} lg={3}>
                                    <Col>
                                        <CalculatorInput id="total_wage" label={"Pay per gig"} isEnabled={false} isMoney={true} maxValue={9999.99} value={formData.total_wage} placeholder="Ex. 75.00" required={true} integer={false} onChange={e => setFormDataValue("total_wage", e.target.value)} tooltip={"Payment for gig."}/>
                                    </Col>
                                    <Col lg={3}>
                                        <CalculatorInput id="event_hours" label={"Hours per gig"} isEnabled={false} maxValue={999} value={formData.event_hours} placeholder="Ex. 3" required={true} integer={false} onChange={e => setFormDataValue("event_hours", e.target.value)} tooltip={"Number of hours for event. Does not include rehearsal or practice hours."}/>
                                    </Col>
                                    <Col lg={5}>
                                        <CalculatorInput id="event_num" label={"Number of gigs"} button={true} buttonText={"Options"} buttonDisabled={!formEnabled.event_num} buttonOnClick={() => {setGigNumModalOpen(!gigNumModalOpen)}} checked={formEnabled.event_num} onCheck={() => {setFormEnabledValue("event_num", !formEnabled.event_num)}} max={2} value={formData.event_num || ""} placeholder="Ex. 1" disabled={!formEnabled.event_num} onChange={e => setFormDataValue("event_num", e.target.value)} tooltip={"Number of gigs. Used if you have multiple of the same gig or service. Will multiply any activated fields in the options by number of gigs."}/>
                                        <GigOptionsModal show={gigNumModalOpen} onHide={() => {setGigNumModalOpen(false)}} setFormDataValue={setFormDataValue} formData={formData}/>
                                    </Col>
                                </Row>
                            </Form.Group>
                            <hr />
                            <h3>Travel</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} md={2}>
                                    <Col>
                                        <Row className="mb-1">
                                            <CalculatorInput id="total_mileage" label={"Total Mileage"} button={true} buttonText={"Use Location"} buttonOnClick={() => {setLocationModalOpen(!locationModalOpen)}} checked={formEnabled.total_mileage} onCheck={() => {setFormEnabledValue("total_mileage", !formEnabled.total_mileage)}} maxValue={9999.99} value={formData.total_mileage} placeholder="Ex. 20" integer={false} disabled={!formEnabled.total_mileage} onChange={e => setFormDataValue("total_mileage", e.target.value)} tooltip={"Total number of miles driven to get to event. Will multiply by <i>Gas Price per Mile</i> for final result. Click <strong>Use Location</strong> to calculate based off Zip Code."}/>
                                            <Modal show={locationModalOpen} onHide={() => setLocationModalOpen(false)} centered={true}>
                                                <Form onSubmit={e => e.preventDefault()}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Calculate Mileage by Location</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>Input origin and destination zip codes to calculate mileage and distance using Google Maps.</p>
                                                        <InputGroup className="mb-2">
                                                            <InputGroup.Text>Origin Zip</InputGroup.Text>
                                                            <FormNumber id="modalOriginZip" value={modalOriginZip} onChange={e => {setModalOriginZip(e.target.value); if (!isGettingLocation) e.target.setCustomValidity("")}} placeholder={"Ex. 94043"} required={true} autoFocus={true} min={5} max={5}></FormNumber>
                                                            <TooltipButton text="Zip code of where you are coming from."/>
                                                        </InputGroup>
                                                        <InputGroup>
                                                            <InputGroup.Text>Destination Zip</InputGroup.Text>
                                                            <FormNumber id="modalDestinationZip" value={modalDestinationZip} onChange={e => {setModalDestinationZip(e.target.value); if (!isGettingLocation) e.target.setCustomValidity("")}} placeholder={"Ex. 94043"} required={true} min={5} max={5}></FormNumber>
                                                            <TooltipButton text="Zip code of where you are going."/>
                                                        </InputGroup>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                    <Button type="submit" variant="primary" onClick={() => getZipCodes()}>
                                                        {isGettingLocation ? <BarLoader color="#FFFFFF" height={4} /> : "Calculate"}
                                                    </Button>
                                                    </Modal.Footer>
                                                </Form>
                                            </Modal>
                                        </Row>
                                        <Row className="mb-3">
                                            <CalculatorInput id="travel_hours" label={"Travel Hours"} checked={formEnabled.travel_hours} onCheck={() => {setFormEnabledValue("travel_hours", !formEnabled.travel_hours)}} maxValue={99.9} value={formData.travel_hours} placeholder="Ex. 2.5" integer={false} disabled={!formEnabled.travel_hours} onChange={e => setFormDataValue("travel_hours", e.target.value)} tooltip={"Number of hours spent traveling. Will be added to total hours."}/>
                                        </Row>
                                        <Row className="mb-3">
                                            <TripNumber customTripNum={customTripNum} setCustomTripNum={setCustomTripNum} tripNumSelect={tripNumSelect} setTripNumSelect={setTripNumSelect} formEnabled={formEnabled} setFormDataValue={setFormDataValue} responsive={true} />
                                        </Row>
                                    </Col>
                                    <Col>
                                        <CalculatorInput id='gasPricePerMile' isEnabled={false} isMoney={true} label={"Gas Price per Mile"} button={true} buttonText={"Use Average"} buttonOnClick={() => {setGasModalOpen(true)}} checked={formEnabled.total_mileage} onCheck={() => {setFormEnabledValue("total_mileage", !formEnabled.total_mileage)}} maxValue={9.99} value={gasPricePerMile} placeholder="Ex. 0.14" integer={false} disabled={!formEnabled.total_mileage} onChange={e => setGasPricePerMile(e.target.value)} tooltip={"Price of gas per mile. Calculated using <i>Gas $/Gallon</i> and <i>Vehicle MPG</i>. Click <strong>Calculate Average</strong> to use average values."}/>
                                        <Modal show={gasModalOpen} onHide={() => setGasModalOpen(false)} centered={true}>
                                            <Form onSubmit={e => e.preventDefault()}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Use Average Gas $ Per Mile</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                <p>Select state to use for average gas price. Average gas price obtained from <a href="https://gasprices.aaa.com/state-gas-price-averages/" target="_blank" style={{color: "black"}}>AAA Daily Average</a>. Select vehicle type to use average MPG.</p>
                                                <InputGroup className="mb-2">
                                                    <InputGroup.Text>Select State</InputGroup.Text>
                                                    <Form.Select id="selectState" value={currentState} onChange={(e) => {setCurrentState(e.target.value)}}>
                                                        <option key={"average_gas"} value={"average_gas"}>Average</option>
                                                        {gasPrices ? Object.keys(gasPrices).map((element) => {if (element.length == 2) return <option key={element} value={element}>{element}</option>}) : ""}
                                                    </Form.Select>
                                                    <TooltipButton text='Select State to use average values. Select <i>Average</i> for average gas price across the United States.'/>
                                                </InputGroup>
                                                <InputGroup>
                                                    <InputGroup.Text>Select Vehicle Type</InputGroup.Text>
                                                        <Form.Select id="selectVehicleType" value={currentVehicle} onChange={(e) => {setCurrentVehicle(e.target.value)}}>
                                                            <option key={"average_mpg"} value={"average_mpg"}>Average</option>
                                                            {gasPrices ? Object.keys(gasPrices).map((element) => {
                                                                if (element != "average_gas" && element != "average_mpg" && element.length > 2)
                                                                {
                                                                    let displayElement = element.replace("_mpg", "").replace("_", "/").replace("van", "Van").replace("suv", "SUV");
                                                                    displayElement = displayElement[0].toUpperCase() + displayElement.slice(1);
                                                                    return <option key={element} value={element}>{displayElement}</option>
                                                                } 
                                                            }) : ""}
                                                        </Form.Select>
                                                    <TooltipButton text='Select your type of vehicle. Will determine average MPG value. Choose <i>Average</i> for average MPG value.'/>
                                                </InputGroup>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                <Button type="submit" variant="primary" onClick={() => setAverageGasPrice()}>Select</Button>
                                                </Modal.Footer>
                                            </Form>
                                        </Modal>
                                        
                                        <Col md={{offset: 1}}>
                                            <Row>
                                                <CalculatorInput id="gas_price" preText={"Gas $/Gallon"} isEnabled={false} maxValue={9.99} value={formData.gas_price} placeholder="Ex. 2.80" integer={false} disabled={!formEnabled.total_mileage} onChange={e => setFormDataValue("gas_price", e.target.value)} tooltip={"Amount of money in dollars per gallon of gas. Divided by <i>Vehicle MPG</i> to calculate <i>Gas Price per Mile</i>."}/>
                                            </Row>
                                            <Row >
                                                <CalculatorInput id="mpg" preText={"Vehicle MPG"} isEnabled={false} max={99.9} value={formData.mpg} placeholder="Ex. 20" integer={false} disabled={!formEnabled.total_mileage} onChange={e => setFormDataValue("mpg", e.target.value)} tooltip={"Miles-Per-Gallon of your vehicle. Divisor of <i>Gas $/Gallon</i> to calculate <i>Gas Price per Mile</i>."}/>
                                            </Row>
                                        </Col>
                                        <Row className="my-3">
                                            <CalculatorInput id="mileage_covered" isMoney={true} label={"Mileage Covered (in $ per mile)"} checked={formEnabled.mileage_covered} onCheck={() => {setFormEnabledValue("mileage_covered", !formEnabled.mileage_covered)}} maxValue={999.99} value={formData.mileage_covered} placeholder="Ex. 0.21" integer={false} disabled={!formEnabled.mileage_covered} onChange={e => setFormDataValue("mileage_covered", e.target.value)} tooltip={"Number of miles that will be covered by organizers. Will subtract from total mileage for final result."}/>
                                        </Row>
                                        <Row className="mb-3">
                                            <CalculatorInput id="travel_fees" isMoney={true} label={"Additional Travel Costs"} checked={formEnabled.travel_fees} onCheck={() => {setFormEnabledValue("travel_fees", !formEnabled.travel_fees)}} maxValue={99999.99} value={formData.travel_fees} placeholder="Ex. 4.50" integer={false} disabled={!formEnabled.travel_fees} onChange={e => setFormDataValue("travel_fees", e.target.value)} tooltip={"Any additional travel fees (i.e. tolls, parking). This field can also be used to input flat-rate travel costs (such as public transit fares, taxi, ridesharing etc.). This field will be multiplied by <i>Number of gigs</i>, but not <i>Trip Number</i>."}/>
                                        </Row>
                                        
                                    </Col>
                                </Row>
                            </Form.Group>
                            <hr />
                            <h3>Additional Hours</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} md={2}>
                                    <Col>
                                        <CalculatorInput id="practice_hours" label={"Individual Practice Hours"} checked={formEnabled.practice_hours} onCheck={() => {setFormEnabledValue("practice_hours", !formEnabled.practice_hours)}} max={999.9} value={formData.practice_hours} placeholder="Ex. 3" integer={false} disabled={!formEnabled.practice_hours} onChange={e => setFormDataValue("practice_hours", e.target.value)} tooltip={"The total hours spent practicing for event (individually, not including group rehearsal)."}/>
                                    </Col>
                                    <Col>
                                        <CalculatorInput id="rehearsal_hours" label={"Rehearsal Hours"} checked={formEnabled.rehearsal_hours} onCheck={() => {setFormEnabledValue("rehearsal_hours", !formEnabled.rehearsal_hours)}} max={999.9} value={formData.rehearsal_hours} placeholder="Ex. 2" integer={false} disabled={!formEnabled.rehearsal_hours} onChange={e => setFormDataValue("rehearsal_hours", e.target.value)} tooltip={"The total hours spent in rehearsal for event (not including individual practice)."} />
                                    </Col>
                                </Row>
                            </Form.Group>
                            <hr />
                            <h3>Other Expenses</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} md={2}>
                                    <Col>
                                        <CalculatorInput id="tax" preText="%" label={"Income Tax Percentage"} checked={formEnabled.tax} onCheck={() => {setFormEnabledValue("tax", !formEnabled.tax)}} value={formData.tax} maxValue={100} placeholder="Ex. 17.5" integer={false} disabled={!formEnabled.tax} onChange={e => setFormDataValue("tax", e.target.value)} tooltip={"Percentage of income tax. Taken from initial <i>Pay per gig</i> before any other expenses."} />                           
                                    </Col>
                                    <Col>
                                        <CalculatorInput id="fees" label={"Other Fees"} isMoney={true} checked={formEnabled.fees} onCheck={() => {setFormEnabledValue("fees", !formEnabled.fees)}} maxValue={9999.99} value={formData.fees} placeholder="Ex. 15.00" integer={false} disabled={!formEnabled.fees} onChange={e => setFormDataValue("fees", e.target.value)} tooltip={"Any other additional fees (i.e. food, instrument wear etc.) Will be subtracted at the end of the calculation."} />
                                    </Col>
                                </Row>
                            </Form.Group>
                        <br />
                    </Col>
                    {/* Column 2: Results */}
                    <Col>
                        <Row>
                            <Container>
                                <h3>Results</h3>
                                <hr />
                            </Container>
                        </Row>
                        <Container>
                        <Row>
                            <Col>
                                
                                <Row>
                                    <Col lg={2} md={2} sm={2} xs={2}>
                                        <h5 style={{display: "block"}}>Payment: </h5>
                                    </Col>
                                    <Col>
                                    <h5 style={{whiteSpace: "pre-wrap", textAlign: "right", display: "block"}}>{formatCurrency(formData.total_wage)}{formEnabled.event_num && formData.multiply_pay && formData.event_num ? ` x ${formData.event_num} = ${formatCurrency(formData.total_wage*formData.event_num)}` : ""}</h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6} md={6} sm={7} xs={5}>
                                        {formEnabled.tax ? <h5 style={{display: "block"}}>Tax Cut ({formData.tax ? formData.tax : "0"}%):</h5> : ""}
                                        {(formEnabled.total_mileage || formEnabled.travel_fees) ? <h5 style={{display: "block"}}>Total Travel Cost:</h5> : ""}
                                        {formEnabled.fees ? <h5 style={{display: "block"}}>Other Fees:</h5> : ""}
                                        <hr style={{margin: "0px ", textAlign: "right", width: "0px"}}/>
                                        <h5 style={{display: "block"}}><br /></h5>
                                        <h5 style={{display: "block"}}>Total Hours: </h5>
                                    </Col>
                                    <Col lg={1} md={1} sm={1} xs={1}>
                                        <div style={{whiteSpace: "pre-wrap"}}>
                                        {formEnabled.tax ? <h5 style={{display: "block"}}>-</h5> : ""}
                                        {(formEnabled.total_mileage || formEnabled.travel_fees) ? <h5 style={{display: "block"}}>-</h5> : ""}
                                        {formEnabled.fees ? <h5 style={{display: "block"}}>-</h5> : ""}
                                        <h5 style={{display: "block"}}><br /></h5>
                                        <h5 style={{display: "block"}}>÷</h5>
                                        </div>
                                    </Col>
                                    <Col>                      
                                        <div style={{whiteSpace: "pre-wrap", textAlign: "right", display: "block"}}>
                                            {formEnabled.tax ? <h5 style={{display: "block"}}>{formatCurrency(totalTax)}</h5> : ""}
                                            {(formEnabled.total_mileage || formEnabled.travel_fees) ? <h5 style={{display: "block"}}>{(formEnabled.total_mileage || formEnabled.travel_fees) ? formatCurrency(totalTravel) : formatCurrency(0)}</h5> : ""}
                                            {formEnabled.fees ? <h5 style={{display: "block"}}>{formatCurrency(totalOtherFees)}</h5> : ""}
                                            <hr style={{margin: "0px ", textAlign: "right"}}/>
                                            <h5 style={{display: "block"}}>{formatCurrency(totalPay)}</h5>
                                            <h5 style={{display: "block"}}>{totalHours}</h5>
                                        </div>
                                    </Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col><h4>Total Hourly Wage:</h4></Col>
                                    <Col style={{textAlign: "right"}} lg="auto" md="auto" sm="auto" xs="auto"><h4>{formatCurrency(hourlyWage)}</h4></Col>
                                </Row>        
                            </Col>
                            </Row>
                            <br />
                            <Row>
                                <div className="mb-3">
                                    {user && <Button className="me-3" type="submit" variant="success" onClick={() => {saveFinancial(false)}} style={{paddingLeft: "10px", paddingRight: "10px"}} disabled={!user}>{saveStatus ? <BarLoader color="#FFFFFF" height={4} width={50} /> : user && paramId ? "Update" : "Save"}</Button>}
                                    {!user && <OverlayTrigger placement="bottom" overlay={<Popover id="popover-trigger-hover-focus" title="Tool Tip" style={{padding: "10px"}}><div dangerouslySetInnerHTML={{__html: "You must be logged in to save."}}/></Popover>}><span><Button className="me-3" type="submit" variant="success" style={{paddingLeft: "10px", paddingRight: "10px"}} disabled={!user}>Save</Button></span></OverlayTrigger>}
                                    <Button className="me-3" type="submit" variant="secondary" onClick={() => {saveFinancial(true)}} style={{paddingLeft: "10px", paddingRight: "10px"}}>Export</Button>
                                    <Button className="float-end" variant="primary" href="/calculator">New Calculation</Button>
                                </div>
                            </Row>
                            {user && 
                                <>
                                <Row className="mt-4">
                                    <Col><h4>Saved Calculations</h4></Col>
                                </Row>
                                <Row>
                                    <input type="text" placeholder="Search calculations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mx-2 mb-2 py-2" style={{width: '95%', borderRadius: "20px", border: '1px solid #ced4da'}}/>
                                </Row>
                                <Row>
                                    <SimpleBar style={{maxHeight: "325px"}}>
                                        <Container>{userFinancials}</Container>
                                    </SimpleBar>
                                </Row>  
                                <Row>
                                    <div>
                                    <Button className="mt-2 mb-3 float-end" variant="secondary" style={{width: "auto"}} onClick={() => {navigate("/account#calculations")}}>Manage</Button>
                                    </div>
                                </Row>  
                                </> 
                            }
                        </Container>
                    </Col>
                </Row>
                </Form>                                             
            </Container>
        </div>
    )
    }
}

export default Calculator