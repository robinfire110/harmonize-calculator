import React, { useEffect, useState } from 'react'
import { ButtonGroup, Form, InputGroup, ToggleButton } from 'react-bootstrap';
import FormNumber from './FormNumber';
import { DATA_VALUE, parseIntZero } from '../Utils';
import TooltipButton from './TooltipButton';

function TripNumber({customTripNum, setCustomTripNum, tripNumSelect, setTripNumSelect, formEnabled, setFormDataValue, responsive=false}) {
    //Responsiveness (for calculator)
    //Use effect
    const [style, setStyle] = useState({});
    const [size, setSize] = useState('md');
    useEffect(() => {
        updateStyle();
        window.addEventListener("resize", updateStyle); 
    }, []);

    function updateStyle() 
    {
        if (responsive)
        {
            console.log("Width", window.innerWidth);
            if (window.innerWidth >= 1200)
            {
                setStyle({});
                setSize('md')
                console.log(style, size)
            } 
            else
            {
                setStyle({fontSize: "16px"});
                setSize('sm');
                console.log(style, size)
            }
        }
    }
    

    return (
        <div>
            <Form.Label>Trip Number</Form.Label>
            <InputGroup>
                <ButtonGroup>
                    <ToggleButton style={style} type="radio" size={size} variant="outline-secondary" value={0} checked={tripNumSelect === 0} onClick={(e) => {setTripNumSelect(0); setFormDataValue("trip_num", 1, DATA_VALUE.INT);}} disabled={formEnabled && (!formEnabled.travel_hours && !formEnabled.total_mileage)}>One-Way</ToggleButton>
                    <ToggleButton style={style} type="radio" size={size} variant="outline-secondary" value={1} checked={tripNumSelect === 1} onClick={(e) => {setTripNumSelect(1); setFormDataValue("trip_num", 2, DATA_VALUE.INT);}} disabled={formEnabled && (!formEnabled.travel_hours && !formEnabled.total_mileage)}>Round Trip</ToggleButton>
                    <ToggleButton style={style} type="radio" size={size} variant="outline-secondary" value={2} checked={tripNumSelect === 2} onClick={(e) => {setTripNumSelect(2); setFormDataValue("trip_num", customTripNum, DATA_VALUE.INT);}} disabled={formEnabled && (!formEnabled.travel_hours && !formEnabled.total_mileage)}>Custom</ToggleButton>
                </ButtonGroup>
                <FormNumber id="trip_num" maxValue={999} value={customTripNum} placeholder="Ex. 4" onChange={(e) => {e.target.setCustomValidity(""); setCustomTripNum(e.target.value); setFormDataValue("trip_num", parseIntZero(e.target.value))}} disabled={tripNumSelect != 2} required/>
                <TooltipButton text="Determines how many trips taken. One-Way will multiply travel mileage and hours by 1, Round-Trip by 2 and custom by whatever value is set."/>
            </InputGroup>
        </div>
    )
}

export default TripNumber