import React from 'react'
import { Button, InputGroup } from 'react-bootstrap'
import { Form } from 'react-bootstrap';
import FormNumber from './FormNumber'
import TooltipButton from './TooltipButton'

function CalculatorInput({label="", id, isEnabled=true, isMoney=false, checked, onCheck, preText=null, tooltip=null, button=false, buttonText="Insert Text", buttonOnClick, buttonDisabled, placeholder, onChange, disabled=false, integer=true, required=false, value, controlled=true, min=0, minValue=0, max=99, maxValue=-1, autoFocus=false, name="", customValidity}) {
    //isMoney (sets pretext to $)
    if (isMoney) if (!preText) preText = "$";

    return (
        <div>
            {label !== "" && <Form.Label>{label}{required && <span style={{color: "red"}}>*</span>}</Form.Label>}
            <InputGroup>
                {isEnabled && <Form.Check id={`${id}_switch`} checked={checked} type="switch" style={{marginTop: "5px", paddingLeft: "35px"}} onChange={onCheck}></Form.Check>}
                {preText && <InputGroup.Text>{preText}</InputGroup.Text>}
                <FormNumber id={id} name={name} value={value} placeholder={placeholder} disabled={disabled} onChange={onChange} integer={integer} required={required} controlled={controlled} min={min} minValue={minValue} max={max} maxValue={maxValue} autoFocus={autoFocus} customValidity={customValidity}/>
                {button && <Button variant='light' onClick={buttonOnClick} disabled={buttonDisabled}>{buttonText}</Button>}
                {tooltip && <TooltipButton text={tooltip}/>}
            </InputGroup>
        </div>
    )
}

export default CalculatorInput;