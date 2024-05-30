import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import { Container, Form, Col, Row, InputGroup, Button, Modal, Alert, OverlayTrigger, Card, ButtonGroup, ToggleButton, Popover } from "react-bootstrap";
import moment from "moment";
import TooltipButton from "../components/TooltipButton";
import FormNumber from "../components/FormNumber";
import axios from "axios";
import {BarLoader, ClipLoader} from 'react-spinners'
import * as ExcelJS from "exceljs"
import {saveAs} from "file-saver"
import {autoSizeColumn, formatCurrency, maxFinancialNameLength, metersToMiles, parseBool, parseFloatZero, parseIntZero, parseStringUndefined, toastError, toastInfo, toastSuccess} from "../Utils";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import {getBackendURL} from "../Utils";
import Title from "../components/Title";

const Calculator = () => {
    /* Variables */
    //Account
    const [cookies, , removeCookie] = useCookies([]);
    const [user, setUser] = useState();
    const [userFinancials, setUserFinancials] = useState();

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

    //Search parameters
    const [searchParams] = useSearchParams();

    //States
    //Variables
    const [calcName, setCalcName] = useState();
    const [nameLength, setNameLength] = useState(maxFinancialNameLength);
    const [calcDate, setCalcDate] = useState(moment().format("YYYY-MM-DD"));
    const [gigPay, setGigPay] = useState();
    const [gigHours, setGigHours] = useState();
    const [gigNum, setGigNum] = useState();
    const [multiplyPay, setMultiplyPay] = useState(true);
    const [multiplyGigHours, setMultiplyGigHours] = useState(true);
    const [multiplyTravel, setMultiplyTravel] = useState(true);
    const [multiplyRehearsalHours, setMultiplyRehearsalHours] = useState(false);
    const [multiplyPracticeHours, setMultiplyPracticeHours] = useState(false);
    const [multiplyOtherFees, setMultiplyOtherFees] = useState(false);
    const [totalMileage, setTotalMileage] = useState();
    const [mileageCovered, setMileageCovered] = useState();
    const [travelHours, setTravelHours] = useState();
    const [isRoundTrip, setIsRoundTrip] = useState(1);
    const [gasPricePerMile, setGasPricePerMile] = useState();
    const [gasPricePerGallon, setGasPricePerGallon] = useState();
    const [vehicleMPG, setVehicleMPG] = useState();
    const [practiceHours, setPracticeHours] = useState();
    const [rehearsalHours, setRehearsalHours] = useState();
    const [tax, setTax] = useState();
    const [otherFees, setOtherFees] = useState();
    const [totalOtherFees, setTotalOtherFees] = useState();
    const [totalGas, setTotalGas] = useState(0.0); 
    const [totalTax, setTotalTax] = useState(0.0); 
    const [totalHours, setTotalHours] = useState(0.0);
    const [totalPay, setTotalPay] = useState(0);
    const [hourlyWage, setHourlyWage] = useState(0.0);
    const [gasPrices, setGasPrices] = useState();
    const [zip, setZip] = useState("");
    const [zipCodeError, setZipCodeError] = useState(false);
    const [modalOriginZip, setModalOriginZip] = useState("");
    const [modalDestinationZip, setModalDestinationZip] = useState("");
    const [saveStatus, setSaveStatus] = useState(false);

    //Enable
    const [gigNumEnabled, setGigNumEnabled] = useState(false);
    const [totalMileageEnabled, setTotalMileageEnabled] = useState(false);
    const [travelHoursEnabled, setTravelHoursEnabled] = useState(false);
    const [mileageCoveredEnabled, setMileageCoveredEnabled] = useState(false);
    const [practiceHoursEnabled, setPracticeHoursEnabled] = useState(false);
    const [rehearsalHoursEnabled, setRehearsalHoursEnabled] = useState(false);
    const [taxEnabled, setTaxEnabled] = useState(false);
    const [otherFeesEnabled, setOtherFeesEnabled] = useState(false);

    /* Effect */
    //On first load
    useEffect(() => {
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
        if (cookies.jwt)
        {
            axios.get(`${getBackendURL()}/account`, {withCredentials: true}).then(res => {
                if (res.data?.user)
                {
                    console.log(res.data.user.user_id);
                    axios.get(`${getBackendURL()}/user/id/${res.data.user.user_id}`, { withCredentials: true }).then(res => {
                        const userData = res.data;

                        //Set User Defaults
                        setModalOriginZip(userData.zip || '');
                        setCurrentState(userData.default_state || '');
                        setCurrentVehicle(userData.default_vehicle || '');
                        setMileageCovered(userData.default_miles_covered || null);
                        setIsRoundTrip(parseBool(userData.round_trip));
                        setPracticeHours(userData.default_practice || null);
                        setRehearsalHours(userData.default_rehearsal || null);
                        setTax(userData.default_tax || null);
                        setOtherFees(userData.default_fees || null);
                        setMultiplyPay(userData.multiply_pay);
                        setMultiplyGigHours(userData.multiply_hours);
                        setMultiplyTravel(userData.multiply_travel);
                        setMultiplyPracticeHours(userData.multiply_practice);
                        setMultiplyRehearsalHours(userData.multiply_rehearsal);
                        setMultiplyOtherFees(userData.multiply_other);

                        //Set gas prices
                        setAverageGasPrice(undefined, userData.default_state, userData.default_vehicle);

                        //Set Switches
                        setMileageCoveredEnabled(userData.default_miles_covered > 0);
                        setPracticeHoursEnabled(userData.default_practice > 0);
                        setRehearsalHoursEnabled(userData.default_rehearsal > 0);
                        setTaxEnabled(userData.default_tax > 0);
                        setOtherFeesEnabled(userData.default_fees > 0);
                        
                        setUser(userData);
                    });  
                }
                else 
                {
                    setUser(undefined);
                }
                //console.log("User Data", res.data);
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

        //Set switches
        
    }, [gigPay, gigHours, gigNum, totalMileage, mileageCovered, gasPricePerMile, travelHours, practiceHours, rehearsalHours, tax, otherFees,
        gigNumEnabled, totalMileageEnabled, mileageCoveredEnabled, travelHoursEnabled, practiceHoursEnabled, rehearsalHoursEnabled, taxEnabled, otherFeesEnabled,
        isRoundTrip, multiplyPay, multiplyGigHours, multiplyTravel, multiplyPracticeHours, multiplyRehearsalHours, multiplyOtherFees])

    //Runs when any fields related to gas price calcuation updates.
    useEffect(() => {
      calculateGasPerMile();
    }, [gasPricePerGallon, vehicleMPG])

    //Update name length
    useEffect(() => {
        const nameBox = document.getElementById("financialName");
        if (nameBox)
        {
            setNameLength(maxFinancialNameLength-nameBox.value.length);
        } 
    }, [calcName]);
    
    /* Functions */
    //Load data
    function loadData(data)
    {
        if (data?.fin_name) setCalcName(data.fin_name);
        if (data?.date) setCalcDate(data.date)
        if (data?.zip) setZip(data.zip);
        if (data?.hourly_wage) setHourlyWage(data.hourly_wage);
        if (data?.total_wage > 0) setGigPay(data.total_wage);
        if (data?.total_mileage > 0) setTotalMileage(data.total_mileage); 
        if (data?.travel_hours > 0) setTravelHours(data.travel_hours); 
        if (data?.mileage_pay > 0) setMileageCovered(data.mileage_pay); 
        if (data?.gas_price > 0) setGasPricePerGallon(data.gas_price);
        if (data?.mpg > 0) setVehicleMPG(data.mpg);
        if (data?.practice_hours > 0) setPracticeHours(data.practice_hours); 
        if (data?.rehearse_hours > 0) setRehearsalHours(data.rehearse_hours); 
        if (data?.tax > 0) setTax(data.tax); 
        if (data?.fees > 0) setOtherFees(data.fees);
        if (data?.round_trip != undefined) setIsRoundTrip(data.round_trip);
        if (data?.multiply_pay != undefined) setMultiplyPay(data.multiply_pay);
        if (data?.multiply_hours != undefined) setMultiplyGigHours(data.multiply_hours);
        if (data?.multiply_travel != undefined) setMultiplyTravel(data.multiply_travel);
        if (data?.multiply_practice != undefined) setMultiplyPracticeHours(data.multiply_practice);
        if (data?.multiply_rehearsal != undefined) setMultiplyRehearsalHours(data.multiply_rehearsal);
        if (data?.multiply_other != undefined) setMultiplyOtherFees(data.multiply_other);
        console.log(data);

        //Set switches
        setGigNumEnabled(data?.event_num > 0);
        setTotalMileageEnabled(data?.total_mileage > 0);
        setTravelHoursEnabled(data?.travel_hours > 0);
        setMileageCoveredEnabled(data?.mileage_pay > 0);
        setPracticeHoursEnabled(data?.practice_hours > 0);
        setRehearsalHoursEnabled(data?.rehearse_hours > 0);
        setTaxEnabled(data?.tax > 0);
        setOtherFeesEnabled(data?.fees > 0);
        if (data?.zip) setModalDestinationZip(data?.zip);
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
                setParamId(0);
                navigate(`/calculator`); 
                toast("You do not have access to this data.", toastError)
            }
        });
    }
    
    async function calculateBasedOnLocation(originZip, destinationZip)
    {
        setIsGettingLocation(true);
        axios.get(`${getBackendURL()}/api/distance_matrix/${originZip}/${destinationZip}/`).then(res => {
            if (res.data)
            {
                if (res.data.status == "OK" && res.data.rows[0].elements[0].status == "OK")
                {
                    const distance = res.data.rows[0].elements[0].distance.value;
                    const duration = res.data.rows[0].elements[0].duration.value;
                    const distanceInMiles = metersToMiles(distance).toFixed(2);
                    const durationInHours = ((duration/60)/60).toFixed(2);
                    setTotalMileageEnabled(true);
                    setTravelHoursEnabled(true);
                    setTotalMileage(distanceInMiles);
                    setTravelHours(durationInHours);
                    setLocationModalOpen(false);
                    setIsGettingLocation(false);

                    //Set state
                    //This works, but I'm debating if we want it or not. It may be a bit disorienting. I tried to add a setting, but I couldn't find a good place to put it.
                    /*
                    let string = res.data.origin_addresses[0]
                    setCurrentState(string.substring(string.indexOf(",")+2, string.indexOf(",")+4))
                    */
                }
                else
                {
                    //Signal Modal If Something Wrong
                    setZipCodeError(true);
                    setIsGettingLocation(false);
                }
            }
        }).catch(error => {
            console.log(error);
        });
    }

    //Get Zip Codes from Modal
    async function getZipCodes()
    {
        //Get elements
        const elementOriginZip = document.getElementById("modalOriginZip");
        const elementDestinationZip = document.getElementById("modalDestinationZip");
        if (!isGettingLocation)
        {
            if (modalOriginZip.length == 5 && modalDestinationZip.length == 5)
            {
                calculateBasedOnLocation(modalOriginZip, modalDestinationZip);
            }
            else
            {
                if (modalOriginZip.length != 5) elementOriginZip.setCustomValidity("Zip codes must be 5 characters (#####).");
                else if (modalDestinationZip.length != 5) elementDestinationZip.setCustomValidity("Zip codes must be 5 characters (#####).");
            }
        }
    }

    //Calculate wage
    function calculateHourlyWage() 
    {
        let wage = 0;
        let finalPay = 0;

        //Set multiples
        let gigHoursNum = gigNumEnabled && gigNum && multiplyGigHours ? parseFloat(gigNum) : 1;
        let practiceHoursNum = gigNumEnabled && gigNum && multiplyPracticeHours ? parseFloat(gigNum) : 1;
        let rehearsalHoursNum = gigNumEnabled && gigNum && multiplyRehearsalHours ? parseFloat(gigNum) : 1;
        let travelNum = gigNumEnabled && gigNum && multiplyTravel? parseFloat(gigNum) : 1;
        let otherFeesNum = gigNumEnabled && gigNum && multiplyOtherFees? parseFloat(gigNum) : 1;
        let roundTrip = isRoundTrip == 1 ? 2 : 1;

        //Calculate possible income
        if (gigPay) wage = parseFloat(gigPay);
        if (gigNumEnabled && gigNum && multiplyPay) wage *= parseInt(gigNum);

        //Calculate tax (if needed)
        if (taxEnabled)
        {  
            let currentTax = 0;
            if (tax) currentTax = wage * (parseFloat(tax)/100);
            setTotalTax(currentTax);
            wage -= currentTax;
        } 

        //Calculate mileage pay
        if (totalMileageEnabled && totalMileage && gasPricePerMile)
        {
            let gasPrice = parseFloat(gasPricePerMile);
            //Subtract mileage covered
            if (mileageCoveredEnabled && mileageCovered) gasPrice -= parseFloat(mileageCovered);
            gasPrice = parseFloat(totalMileage) * roundTrip * travelNum * gasPrice;
            setTotalGas(gasPrice);
            wage -= gasPrice;
        }

        //Other fees (if needed)
        if (otherFeesEnabled && otherFees)
        {
            let fees = parseFloat(otherFees) * (otherFeesNum);
            setTotalOtherFees(fees)
            wage -= fees;
        } 

        //Calculate hours
        let hours = 0;
        
        if (gigHours) hours = parseFloat(gigHours) * gigHoursNum;
        if (practiceHoursEnabled && practiceHours) hours += parseFloat(practiceHours) * practiceHoursNum;
        if (rehearsalHoursEnabled && rehearsalHours) hours += parseFloat(rehearsalHours) * rehearsalHoursNum;
        if (travelHoursEnabled && travelHours) hours += parseFloat(travelHours) * travelNum * roundTrip;
        setTotalHours(hours.toFixed(2));

        //Final division
        setTotalPay(wage);
        if (hours > 0) finalPay = wage/hours;
        if (!gigPay) finalPay = 0;
        
        //Convert
        setHourlyWage(finalPay);
    }

    //Calculate gas per mile
    function calculateGasPerMile() 
    {
        if (gasPricePerGallon && vehicleMPG)
        {
            //Set
            let value = (gasPricePerGallon/vehicleMPG).toFixed(2);
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
        let data = gasPrices;
        if (dataOverride) data = dataOverride;

        //Set data
        if (data)
        {
            /* Check if login, use local state. Else, use default. */
            setGasPricePerGallon(Math.round(data[state] * 100) / 100);
            setVehicleMPG(data[vehicle]);
            setGasModalOpen(false);
        }
    }

    async function saveFinancial(spreadsheet)
    {
        if (!saveStatus)
        {
            //Get data
            const data = {
                fin_name: parseStringUndefined(calcName),
                date: moment(calcDate).format("YYYY-MM-DD"),
                total_wage: parseFloatZero(gigPay),
                event_hours: parseFloatZero(gigHours),
                event_num: parseIntZero(gigNum),
                hourly_wage: parseFloatZero(hourlyWage),
                rehearse_hours: parseFloatZero(rehearsalHours),
                practice_hours: parseFloatZero(practiceHours),
                travel_hours: parseFloatZero(travelHours),
                total_mileage: parseFloatZero(totalMileage),
                mileage_pay: parseFloatZero(mileageCovered),
                zip: parseStringUndefined(modalDestinationZip),
                gas_price: parseFloatZero(gasPricePerGallon),
                mpg: parseFloatZero(vehicleMPG),
                tax: parseFloatZero(tax),
                fees: parseFloatZero(otherFees),
                round_trip: isRoundTrip,
                multiply_pay: multiplyPay,
                multiply_hours: multiplyGigHours,
                multiply_travel: multiplyTravel,
                multiply_practice: multiplyPracticeHours,
                multiply_rehearsal: multiplyRehearsalHours,
                multiply_other: multiplyOtherFees
            }
            
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
                    console.log("ADD");
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
                        getSavedFinancials(newUser); 
                    }).catch(error => {
                        toast("An error occured while saving. Please ensure all fields are filled out correctly and try again.", toastError);
                        setSaveStatus(false);
                        console.log(error);
                    });
                };
            }
            else
            {
                saveSpreadsheet();
            }
        }
    }

    //Save spreadsheet
    async function saveSpreadsheet()
    {
        try 
        {
            //Create workbook
            const workbook = new ExcelJS.Workbook();
            workbook.created = new Date();
            workbook.modified = new Date();

            //Create worksheet
            const worksheet = workbook.addWorksheet("Calculator Results");

            //Set Rows
            const rows = [];
            rows.push(worksheet.addRow(["Name", "Date", "Total Wage", "Number of gigs"]));
            rows.push(worksheet.addRow([calcName, calcDate, parseFloatZero(gigPay), parseIntZero(gigNum) == 0 ? 1 : parseIntZero(gigNum), "", "Payment", parseFloatZero(gigPay)]));
            rows[1].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
            rows.push(worksheet.addRow(["", "", "", "", "", "Tax Cut", parseFloatZero(totalTax)])); //Results row
            rows.push(worksheet.addRow(["Event Hours", "Individual Practice Hours", "Rehearsal Hours", "", "", "Travel Cost", parseFloatZero(totalGas)]));
            rows.push(worksheet.addRow([parseFloatZero(gigHours), parseFloatZero(practiceHours), parseFloatZero(rehearsalHours), "", "", "Other Fees", parseFloatZero(otherFees)]));
            rows.push(worksheet.addRow([""])); //Results row
            rows.push(worksheet.addRow(["Total Mileage", "Travel Hours", "Mileage Covered", "Trip Type", "", "Total Hours", parseFloatZero(totalHours)]));
            rows.push(worksheet.addRow([parseFloatZero(totalMileage), parseFloatZero(travelHours), parseFloatZero(mileageCovered), "", "", "Total Hourly Wage", parseFloatZero(hourlyWage)]));
            rows[7].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
            rows.push(worksheet.addRow([""])); //Results row
            rows.push(worksheet.addRow(["Gas Price per Gallon", "Vehicle MPG", "Gas Price per Mile"]));
            rows.push(worksheet.addRow([parseFloatZero(gasPricePerGallon), parseFloatZero(vehicleMPG), parseFloatZero(gasPricePerMile)]));
            rows[10].getCell(1).numFmt = '$#,##0.00'; //Format cell as currency
            rows[10].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
            rows.push(worksheet.addRow([""])); //Results row
            rows.push(worksheet.addRow(["Tax Percentage (%)", "Other Fees"]));
            rows.push(worksheet.addRow([parseFloatZero(tax), parseFloatZero(otherFees)]));
            rows[13].getCell(1).numFmt = '0.00##\\%'; //Format cell as currency
            rows[13].getCell(2).numFmt = '$#,##0.00'; //Format cell as currency

            //Bold
            const boldRows = [1, 4, 7, 10, 13];
            boldRows.forEach(row => {
                rows[row-1].font = {bold: true};
            });
            worksheet.getColumn("F").font = {bold: true};
            worksheet.getColumn("G").font = {bold: false};

            //Merge Cells
            worksheet.mergeCells("F1:G1");
            worksheet.getCell('F1').value = 'Results';
            worksheet.getCell('F1').alignment = {horizontal: "center"};
            worksheet.getCell('F1').font = {bold: true};
            worksheet.mergeCells("F10:G10");
            worksheet.getCell('F10').value = 'Options';
            worksheet.getCell('F10').alignment = {horizontal: "center"};
            worksheet.getCell('F10').font = {bold: true};
            
            //Format
            worksheet.getColumn("G").numFmt = '$#,##0.00';
            worksheet.getCell('G7').numFmt = "0.00";

            //Trip Type Select
            worksheet.getCell('D8').dataValidation = {
                type: "list",
                allowBlank: "false",
                formulae: ['"One-Way,Round Trip"']
            }
            worksheet.getCell('D8').value = isRoundTrip == 1 ? "Round Trip" : "One-Way";

            //Options
            const enabledDataValidation = {
                type: "list",
                allowBlank: false,
                formulae: ['"Enabled,Disabled"']
            }
            worksheet.getCell("F11").value = "Multiply Pay";
            worksheet.getCell("G11").dataValidation = enabledDataValidation;
            worksheet.getCell("G11").value = multiplyPay == 1 ? "Enabled" : "Disabled";
            worksheet.getCell("F12").value = "Multiply Gig Hours";
            worksheet.getCell("G12").dataValidation = enabledDataValidation;
            worksheet.getCell("G12").value = multiplyGigHours == 1 ? "Enabled" : "Disabled";
            worksheet.getCell("F13").value = "Multiply Travel";
            worksheet.getCell("G13").dataValidation = enabledDataValidation;
            worksheet.getCell("G13").value = multiplyTravel == 1 ? "Enabled" : "Disabled";
            worksheet.getCell("F14").value = "Multiply Practice";
            worksheet.getCell("G14").dataValidation = enabledDataValidation;
            worksheet.getCell("G14").value = multiplyPracticeHours == 1 ? "Enabled" : "Disabled";
            worksheet.getCell("F15").value = "Multiply Rehearsal";
            worksheet.getCell("G15").dataValidation = enabledDataValidation;
            worksheet.getCell("G15").value = multiplyRehearsalHours == 1 ? "Enabled" : "Disabled";
            worksheet.getCell("F16").value = "Multiply Other Fees";
            worksheet.getCell("G16").dataValidation = enabledDataValidation;
            worksheet.getCell("G16").value = multiplyOtherFees == 1 ? "Enabled" : "Disabled";

            //Validation
            worksheet.getCell("D2").dataValidation = {
                type: "whole",
                allowBlank: false,
                operator: "greaterThan",
                formulae: [0],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Value',
                error: "This value must be at least 1"
            }

            //Borders
            worksheet.getCell("F5").border = {bottom: {style: "thin"}};
            worksheet.getCell("G5").border = {bottom: {style: "thin"}};
            worksheet.getCell("F7").border = {bottom: {style: "thin"}};
            worksheet.getCell("G7").border = {bottom: {style: "thin"}};

            //Set formulas
            worksheet.getCell("G2").value = {formula: 'C2*IF(G11="Enabled", D2, 1)'}; //Payment
            worksheet.getCell("G3").value = {formula: 'G2*(0.01*A14)'}; //Tax Cut
            worksheet.getCell("G4").value = {formula: '(A8*IF(D8="Round Trip", 2, 1)*(ROUND(C11, 2)-C8))*IF(G13="Enabled", D2, 1)'}; //Travel Cost
            worksheet.getCell("G5").value = {formula: 'B14*IF(G16="Enabled", D2, 1)'}; //Other Fees 
            worksheet.getCell("G6").value = {formula: 'G2-G3-G4-G5'}; //Total Income
            worksheet.getCell("G7").value = {formula: '=(A5*IF(G12="Enabled", D2, 1))+(B5*IF(G14="Enabled", D2, 1))+(C5*IF(G15="Enabled", D2, 1))+(B8*IF(G13="Enabled", D2, 1)*IF(D8="Round Trip", 2, 1))'}; //Total Hours
            worksheet.getCell("G8").value = {formula: 'IFERROR(G6/G7, 0)'}; //Total Hourly Wage
            worksheet.getCell("C11").value = {formula: 'IFERROR(A11/B11, 0)'}; //Gas Price per Mile

            //Fit Column Width
            autoSizeColumn(worksheet);

            const buf = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buf]), `${calcName.replace(/ /g,"_")}.xlsx`);
            toast("Calculator data exported", toastSuccess);
        }
        catch(error)
        {
            console.log(error);
            toast("An error occured while exporting. Please ensure all fields are filled out correctly and try again.", toastError);
        }
    }

    //Get saved financials
    function getSavedFinancials(userData=user, finId=paramId)
    {
        if (userData)
        {
            const financials = userData.Financials.map((fin, index) =>
                <Row className="my-1 py-1 align-text-middle" style={{backgroundColor: `rgba(100,100,100,${.15+(index % 2 * .15)}`, borderRadius: "3px", verticalAlign: "middle"}} key={fin.fin_id}>
                    <Col><h6>{fin.fin_name}</h6></Col>
                    <Col lg={3} md={3} sm={3} xs={3}><Button variant="secondary" size="sm" disabled={fin.fin_id==finId} href={fin.event_id ? `/calculator/${fin.event_id}?event=true` : `/calculator/${fin.fin_id}`}>Load</Button></Col>
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
            <Title title={"Calculator"} />
            <h2>Harmonize Calculator</h2>
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
                                    <Row className="mb-3" xs={1} lg={2}>
                                        <Col lg="8">
                                            <Form.Label style={{width: '100%'}}>
                                                <Row>
                                                    <Col lg={10}>Name<span style={{color: "red"}}>*</span></Col>
                                                    <Col className="text-end">{nameLength}/{maxFinancialNameLength}</Col>
                                                </Row>
                                            </Form.Label>
                                            <Form.Control id="financialName" value={calcName || ""} type="text" maxLength={maxFinancialNameLength} required={true} placeholder="Calculator Name" onChange={e => setCalcName(e.target.value)} pattern={`[a-zA-Z0-9\\s.'"-]+`}></Form.Control>
                                        </Col>
                                        <Col lg="4">
                                            <Form.Label>Date<span style={{color: "red"}}>*</span></Form.Label>
                                            <Form.Control id="financialDate" value={calcDate || ""} type="date" required={true} onChange={e => setCalcDate(e.target.value)}></Form.Control>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3" xs={1} lg={3}>
                                        <Col>
                                            <Form.Label>Pay per gig<span style={{color: "red"}}>*</span></Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text id="basic-addon1">$</InputGroup.Text>
                                                <FormNumber id="gigPay" maxValue={9999.99} value={gigPay} placeholder="Ex. 75.00" required={true} integer={false} onChange={e => setGigPay(e.target.value)}/>
                                                <TooltipButton text="Payment for gig."/>
                                            </InputGroup>
                                        </Col>
                                        <Col lg={3}>
                                            <Form.Label>Hours per gig<span style={{color: "red"}}>*</span></Form.Label>
                                            <InputGroup>
                                                <FormNumber id="gigHours" maxValue={100} value={gigHours} placeholder="Ex. 3" required={true} integer={false} onChange={e => setGigHours(e.target.value)}/>
                                                <TooltipButton text="Number of hours for event. Does not include rehearsal or practice hours."/>
                                            </InputGroup>
                                        </Col>
                                        <Col lg={5}>
                                            <Form.Label>Number of gigs</Form.Label>
                                            <InputGroup>
                                                <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setGigNumEnabled(!gigNumEnabled)}} checked={gigNumEnabled}></Form.Check>
                                                <FormNumber id="gigNum" max={2} value={gigNum || ""} placeholder="Ex. 1" disabled={!gigNumEnabled} onChange={e => setGigNum(e.target.value)} />
                                                <Button variant='light' disabled={!gigNumEnabled} onClick={() => {setGigNumModalOpen(!gigNumModalOpen)}}>Options</Button>
                                                <TooltipButton text='Number of gigs. Used if you have multiple of the same gig or service. Will multiply any activated fields in the options by number of gigs.'/>
                                            </InputGroup>
                                            <Modal show={gigNumModalOpen} onHide={() => {setGigNumModalOpen(false);}} centered={true}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Number of Services Options</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>
                                                            Choose which attributes get multiplied by number of gigs.
                                                            <br />
                                                            <small>Note - If all options are enabled, number of gigs will make no difference because all fields are multiplied by the same amount.</small>
                                                        </p>
                                                            <Card style={{display:'flex'}}>
                                                                <Container>
                                                                    <Col>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyPay(!multiplyPay)}} checked={multiplyPay}></Form.Check></Col>
                                                                            <Col><div>Multiply Pay</div></Col>
                                                                        </Row>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyGigHours(!multiplyGigHours)}} checked={multiplyGigHours}></Form.Check></Col>
                                                                            <Col><div>Multiply Gig Hours</div></Col>
                                                                        </Row>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyTravel(!multiplyTravel)}} checked={multiplyTravel}></Form.Check></Col>
                                                                            <Col><div>Multiply Travel</div></Col>
                                                                        </Row>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyPracticeHours(!multiplyPracticeHours)}} checked={multiplyPracticeHours}></Form.Check></Col>
                                                                            <Col><div>Multiply Individual Practice Hours</div></Col>
                                                                        </Row>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyRehearsalHours(!multiplyRehearsalHours)}} checked={multiplyRehearsalHours}></Form.Check></Col>
                                                                            <Col><div>Multiply Rehearsal Hours</div></Col>  
                                                                        </Row>
                                                                        <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                                                            <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setMultiplyOtherFees(!multiplyOtherFees)}} checked={multiplyOtherFees}></Form.Check></Col>
                                                                            <Col><div>Multiply Other Fees</div></Col>  
                                                                        </Row>
                                                                    </Col>
                                                                </Container>
                                                            </Card>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                    <Button variant="primary" onClick={() => {setGigNumModalOpen(false)}}>Close</Button>
                                                    </Modal.Footer>
                                            </Modal>
                                        </Col>
                                    </Row>
                            </Form.Group>
                            <hr />
                            <h3>Travel</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} lg={2}>
                                    <Col>
                                        <Row className="mb-1">
                                            <Form.Label>Total Mileage</Form.Label>
                                            <InputGroup>
                                                <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setTotalMileageEnabled(!totalMileageEnabled);}} checked={totalMileageEnabled}></Form.Check>
                                                <FormNumber id="totalMileage" maxValue={9999.99} value={totalMileage} placeholder="Ex. 20" integer={false} disabled={!totalMileageEnabled} onChange={e => setTotalMileage(e.target.value)} />
                                                <Button variant='light' onClick={() => {setLocationModalOpen(!locationModalOpen)}}>Use Location</Button>
                                                <TooltipButton text='Total number of miles driven to get to event. Will multiply by <i>Gas Price per Mile</i> for final result. Click <strong>Use Location</strong> to calculate based off Zip Code.'/>
                                                <Modal show={locationModalOpen} onHide={() => {setLocationModalOpen(false); setZipCodeError(false)}} centered={true}>
                                                    <Form onSubmit={e => e.preventDefault()}>
                                                        <Modal.Header closeButton>
                                                            <Modal.Title>Calculate Mileage by Location</Modal.Title>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <p>Input origin and destination zip codes to calculate mileage and distance using Google Maps.</p>
                                                            {zipCodeError ? <Alert variant="danger" dismissible>An error occured, please ensure zip codes are correct</Alert> : ""}
                                                            <InputGroup className="mb-2">
                                                                <InputGroup.Text>Origin Zip</InputGroup.Text>
                                                                <FormNumber id="modalOriginZip" value={modalOriginZip} onChange={e => {setModalOriginZip(e.target.value); if (!isGettingLocation) e.target.setCustomValidity("")}} placeholder={"Ex. 27413"} required={true} autoFocus={true} min={5} max={5}></FormNumber>
                                                                <TooltipButton text="Zip code of where you are coming from."/>
                                                            </InputGroup>
                                                            <InputGroup>
                                                                <InputGroup.Text>Destination Zip</InputGroup.Text>
                                                                <FormNumber id="modalDestinationZip" value={modalDestinationZip} onChange={e => {setModalDestinationZip(e.target.value); if (!isGettingLocation) e.target.setCustomValidity("")}} placeholder={"Ex. 27413"} required={true} min={5} max={5}></FormNumber>
                                                                <TooltipButton text="Zip code of where you are going."/>
                                                            </InputGroup>
                                                        </Modal.Body>
                                                        <Modal.Footer>
                                                        <Button type="submit" variant="primary" onClick={() => {getZipCodes(); setZipCodeError(false)}}>
                                                            {isGettingLocation ? <BarLoader color="#FFFFFF" height={4} /> : "Calculate"}
                                                        </Button>
                                                        </Modal.Footer>
                                                    </Form>
                                                </Modal>

                                            </InputGroup>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Label>Travel Hours</Form.Label>
                                            <InputGroup>
                                                <Form.Check id="travelHoursSwitch" checked={travelHoursEnabled} type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setTravelHoursEnabled(!travelHoursEnabled)}}></Form.Check>
                                                <FormNumber id="travelHours" maxValue={99.9} value={travelHours} placeholder="Ex. 2.5" integer={false} disabled={!travelHoursEnabled} onChange={e => setTravelHours(e.target.value)} />
                                                <TooltipButton text="Number of hours spent traveling. Will be added to total hours."/>
                                            </InputGroup>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Label>Trip Type</Form.Label>
                                                <ButtonGroup>
                                                    <ToggleButton type="radio" variant="outline-primary" value={0} checked={isRoundTrip === 0} onClick={(e) => setIsRoundTrip(0)} disabled={!travelHoursEnabled && !totalMileageEnabled}>One-Way</ToggleButton>
                                                    <ToggleButton type="radio"variant="outline-primary" value={1} checked={isRoundTrip === 1} onClick={(e) => setIsRoundTrip(1)} disabled={!travelHoursEnabled && !totalMileageEnabled}>Round Trip</ToggleButton>
                                                    <TooltipButton text="Detemines whether mileage is counted as one-way or a round trip. Selecting round trip will muliply travel hours and cost by 2."/>
                                                </ButtonGroup>
                                                
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Form.Label>Gas Price per Mile</Form.Label>
                                        <InputGroup>    
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <FormNumber id='gasPricePerMile' maxValue={9.99} value={gasPricePerMile} placeholder="Ex. 0.14" integer={false} disabled={!totalMileageEnabled} onChange={e => setGasPricePerMile(e.target.value)} />
                                            <Button variant='light' onClick={() => {setGasModalOpen(true)}}>Use Average</Button>
                                            <TooltipButton text='Price of gas per mile. Calculated using <i>Gas $/Gallon</i> and <i>Vehicle MPG</i>. Click <strong>Calculate Average</strong> to use average values.'/>
                                            <Modal show={gasModalOpen} onHide={() => setGasModalOpen(false)} centered={true}>
                                                    <Form onSubmit={e => e.preventDefault()}>
                                                        <Modal.Header closeButton>
                                                            <Modal.Title>Use Average Gas $ Per Mile</Modal.Title>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                        <p>Select state to use for average gas price. Average gas price obtained from <a href="https://gasprices.aaa.com/state-gas-price-averages/" target="_blank">AAA daily average</a>. Select vehicle type to use average MPG.</p>
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

                                        </InputGroup>
                                        <Col md={{offset: 1}}>
                                            <Row>
                                                <InputGroup>    
                                                    <InputGroup.Text>Gas $/Gallon</InputGroup.Text>
                                                    <FormNumber id="gasPricePerGallon" maxValue={9.99} value={gasPricePerGallon} placeholder="Ex. 2.80" integer={false} disabled={!totalMileageEnabled} onChange={e => setGasPricePerGallon(e.target.value)} />
                                                    <TooltipButton text='Amount of money in dollars per gallon of gas. Divided by <i>Vehicle MPG</i> to calculate <i>Gas Price per Mile</i>.'/>
                                                </InputGroup>
                                            </Row>
                                            <Row >
                                                <InputGroup>    
                                                    <InputGroup.Text>Vehicle MPG</InputGroup.Text>
                                                    <FormNumber id="vehicleMPG" max={99.9} value={vehicleMPG} placeholder="Ex. 20" integer={false} disabled={!totalMileageEnabled} onChange={e => setVehicleMPG(e.target.value)} />
                                                    <TooltipButton text='Miles-Per-Gallon of your vehicle. Divisor of <i>Gas $/Gallon</i> to calculate <i>Gas Price per Mile</i>.'/>
                                                </InputGroup>
                                            </Row>
                                        </Col>

                                        <Row className="mt-3">
                                            <Form.Label>Mileage Covered (in $ per mile)</Form.Label>
                                            <InputGroup>
                                                <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setMileageCoveredEnabled(!mileageCoveredEnabled)}} checked={mileageCoveredEnabled}></Form.Check>
                                                <InputGroup.Text>$</InputGroup.Text>
                                                <FormNumber id="mileageCovered" maxValue={999.99} value={mileageCovered} placeholder="Ex. 0.21" integer={false} disabled={!mileageCoveredEnabled} onChange={e => setMileageCovered(e.target.value)} />
                                                <TooltipButton text="Number of miles that will be covered by organizers. Will subtract from total mileage for final result."/>
                                            </InputGroup>
                                        </Row>
                                        
                                    </Col>
                                </Row>
                            </Form.Group>
                            <hr />
                            <h3>Additional Hours</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} lg={2}>
                                    <Col>
                                        <Form.Label>Individual Practice Hours</Form.Label>
                                        <InputGroup>
                                        <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setPracticeHoursEnabled(!practiceHoursEnabled)}} checked={practiceHoursEnabled}></Form.Check>
                                        <FormNumber id="practiceHours" max={999.9} value={practiceHours} placeholder="Ex. 3" integer={false} disabled={!practiceHoursEnabled} onChange={e => setPracticeHours(e.target.value)} />
                                        <TooltipButton text="The total hours spent practicing for event (individually, not including group rehearsal)."/>
                                        </InputGroup>
                                    </Col>
                                    <Col>
                                        <Form.Label>Rehearsal Hours</Form.Label>
                                        <InputGroup>
                                        <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setRehearsalHoursEnabled(!rehearsalHoursEnabled)}} checked={rehearsalHoursEnabled}></Form.Check>
                                        <FormNumber id="rehearsalHours" max={999.9} value={rehearsalHours} placeholder="Ex. 2" integer={false} disabled={!rehearsalHoursEnabled} onChange={e => setRehearsalHours(e.target.value)} />
                                        <TooltipButton text="The total hours spent in rehearsal for event (not including individual practice)."/>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Form.Group>
                            <hr />
                            <h3>Other Expenses</h3>
                            <Form.Group>
                                <Row className="mb-3" xs={1} lg={2}>
                                    <Col>
                                        <Form.Label>Income Tax Percentage</Form.Label>
                                        <InputGroup>
                                            <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setTaxEnabled(!taxEnabled)}} checked={taxEnabled}></Form.Check>
                                            <InputGroup.Text>%</InputGroup.Text>
                                            <FormNumber id="tax" value={tax} maxValue={100} placeholder="Ex. 17.5" integer={false} disabled={!taxEnabled} onChange={e => setTax(e.target.value)} />
                                        <TooltipButton text='Percentage of income tax. Taken from initial <i>Pay per gig</i> before any other expenses.'/>
                                        </InputGroup>
                                    </Col>
                                    <Col>
                                        <Form.Label>Other Fees</Form.Label>
                                        <InputGroup>
                                            <Form.Check type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={() => {setOtherFeesEnabled(!otherFeesEnabled)}} checked={otherFeesEnabled}></Form.Check>
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <FormNumber id="otherFees" maxValue={9999.99} value={otherFees} placeholder="Ex. 15.00" integer={false} disabled={!otherFeesEnabled} onChange={e => setOtherFees(e.target.value)} />
                                            <TooltipButton text="Any other additional fees (i.e. food, parking, instrument wear etc.) Will be subtracted at the end of the calculation."/>
                                        </InputGroup>
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
                                        <h5 style={{whiteSpace: "pre-wrap", textAlign: "right", display: "block"}}>{formatCurrency(gigPay)}{gigNumEnabled && multiplyPay && gigNum ? ` x ${gigNum} = ${formatCurrency(gigPay*gigNum)}` : ""}</h5>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={7} xs={5}>
                                            {taxEnabled ? <h5 style={{display: "block"}}>Tax Cut ({tax ? tax : "0"}%):</h5> : ""}
                                            {totalMileageEnabled ? <h5 style={{display: "block"}}>Total Travel Cost:</h5> : ""}
                                            {otherFeesEnabled ? <h5 style={{display: "block"}}>Other Fees:</h5> : ""}
                                            <hr style={{margin: "0px ", textAlign: "right", width: "0px"}}/>
                                            <h5 style={{display: "block"}}><br /></h5>
                                            <h5 style={{display: "block"}}>Total Hours: </h5>
                                        </Col>
                                        <Col lg={1} md={1} sm={1} xs={1}>
                                            <div style={{whiteSpace: "pre-wrap"}}>
                                            {taxEnabled ? <h5 style={{display: "block"}}>-</h5> : ""}
                                            {totalMileageEnabled ? <h5 style={{display: "block"}}>-</h5> : ""}
                                            {otherFeesEnabled ? <h5 style={{display: "block"}}>-</h5> : ""}
                                            <h5 style={{display: "block"}}><br /></h5>
                                            <h5 style={{display: "block"}}>÷</h5>
                                            </div>
                                        </Col>
                                        <Col>                      
                                            <div style={{whiteSpace: "pre-wrap", textAlign: "right", display: "block"}}>
                                                {taxEnabled ? <h5 style={{display: "block"}}>{formatCurrency(totalTax)}</h5> : ""}
                                                {totalMileageEnabled ? <h5 style={{display: "block"}}>{totalMileage ? formatCurrency(totalGas) : formatCurrency(0)}</h5> : ""}
                                                {otherFeesEnabled ? <h5 style={{display: "block"}}>{formatCurrency(totalOtherFees)}</h5> : ""}
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
                        <Row>
                            <div>
                                {user && <Button className="me-3" type="submit" variant="success" onClick={() => {saveFinancial(false)}} style={{paddingLeft: "10px", paddingRight: "10px"}} disabled={!user}>{saveStatus ? <BarLoader color="#FFFFFF" height={4} width={50} /> : user && paramId ? "Update" : "Save"}</Button>}
                                {!user && <OverlayTrigger placement="bottom" overlay={<Popover id="popover-trigger-hover-focus" title="Tool Tip" style={{padding: "10px"}}><div dangerouslySetInnerHTML={{__html: "You must be logged in to save."}}/></Popover>}><span><Button className="me-3" type="submit" variant="success" style={{paddingLeft: "10px", paddingRight: "10px"}} disabled={!user}>Save</Button></span></OverlayTrigger>}
                                <Button className="me-3" type="submit" variant="secondary" onClick={() => {saveFinancial(true)}} style={{paddingLeft: "10px", paddingRight: "10px"}}>Export</Button>
                            </div>
                            </Row>
                        </Row>
                            {user && <Row className="mt-4">
                                <Col><h4>Saved Financials</h4></Col>
                                </Row>}
                            <Row>
                                <Col style={{maxHeight: "300px", overflowY: "auto", overflowX: "hidden"}}>
                                <Container>
                                        {userFinancials}
                                </Container>
                                </Col>
                            </Row>   
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