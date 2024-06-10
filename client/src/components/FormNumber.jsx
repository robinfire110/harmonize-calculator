import React from 'react';
import { Form } from 'react-bootstrap';

function restrictNumber(e, maxValue, integer=true) {
    let regex = /[^0-9]+$/g;
    if (!integer) regex = /[^0-9.]+$/g;
    let value = e.target.value.replace(regex, "");

    //Only 1 decimal
    if (value.match(/\./g)?.length > 1)
    {
        if (value.slice(-1) == ".") value = value.slice(0, -1);
    }

    //Only two places after decimal
    if (value.includes("."))
    {
        let decimal = value.indexOf(".");
        value = value.slice(0, decimal+3);
    }

    //Max number
    if (maxValue > 0)
    {
        if (parseFloat(value) > maxValue || parseFloat(value.slice([0, value.length-2])) > maxValue) value = maxValue.toString();
    }
    
    e.target.value = value;
}

//Control input with validation (no negative numbers). Uses text input because I don't like the way number input works.
function FormNumber({placeholder, onChange, disabled=false, integer=true, id, required=false, value, controlled=true, min=0, minValue=0, max=99, maxValue=-1, autoFocus=false, name="", customValidity}) {
    if (controlled)
    {
        return (
            <Form.Control type="text" id={id} value={value ?? ""} required={required} disabled={disabled} placeholder={placeholder} pattern={`[0-9]*[.]?[0-9]*.{${min},${max}}`} onChange={onChange} minLength={min} min={minValue} maxLength={max} onInput={e => restrictNumber(e, maxValue, integer)} autoFocus={autoFocus} name={name} onInvalid={(e) => {customValidity && e.target.setCustomValidity(customValidity)}} inputMode='numeric'></Form.Control>
        )
    }
}

export default FormNumber;