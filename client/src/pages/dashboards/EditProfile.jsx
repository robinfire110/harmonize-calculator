import React, { useState, useEffect } from 'react';
import {Form, Button, Container, Col, Row, InputGroup, Modal, Card, ButtonGroup, ToggleButton} from 'react-bootstrap';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import {DATA_VALUE, formatMoneyVars, getBackendURL, maxBioLength, maxFNameLength, maxLNameLength, parseBool, parseFloatZero, parseIntZero, parseStringUndefined, toastError, toastSuccess} from "../../Utils";
import FormNumber from '../../components/FormNumber';
import TooltipButton from '../../components/TooltipButton';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import TripNumber from '../../components/TripNumber';
import CalculatorInput from '../../components/CalculatorInput';
import GigOptionsModal from '../../components/GigOptionsModal';

function EditProfile({ userData, onUserChange, gasPrices}) {
	const [formData, setFormData] = useState({
		email: userData.email,
		zip: userData.zip || "",
		default_state: userData.default_state,
		gas_price: userData.gas_price || null,
		default_vehicle: userData.default_vehicle,
		mpg: userData.mpg || null,
		mileage_covered: userData.mileage_covered || null,
		practice_hours: userData.practice_hours || null,
		rehearsal_hours: userData.rehearsal_hours || null,
		tax: userData.tax || null,
		fees: userData.fees || null,
		trip_num: userData.trip_num,
		travel_fees: userData.travel_fees || null,
		multiply_pay: userData.multiply_pay,
		multiply_hours: userData.multiply_hours,
		multiply_travel: userData.multiply_travel,
		multiply_practice: userData.multiply_practice,
		multiply_rehearsal: userData.multiply_rehearsal,
		multiply_other: userData.multiply_other
	});

	//States
	const [customTripNum, setCustomTripNum] = useState(parseIntZero(userData.trip_num) > 2 ? parseIntZero(userData.trip_num) : "");
	const [tripNumSelect, setTripNumSelect] = useState(parseIntZero(userData.trip_num) <= 2 ? parseIntZero(userData.trip_num) == 1 ? 0 : 1 : 2);
    const [gasPricePerGallon, setGasPricePerGallon] = useState(userData.gas_price || null);
    const [vehicleMPG, setVehicleMPG] = useState(userData.mpg || null);

	//Modal
	const [deleteAccountModal, setDeleteAccountModal] = useState(false);
	const [gigNumModalOpen, setGigNumModalOpen] = useState(false);

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

	//Format Data
	useEffect(() => {
		formatMoneyVars(formData);
	}, []);

	useEffect(() => {
		setFormData({ ...formData, ["gas_price"]: parseFloatZero(gasPricePerGallon) });
	}, [gasPricePerGallon])
	
	useEffect(() => {
		setFormData({ ...formData, ["mpg"]: parseFloatZero(vehicleMPG) });
	}, [vehicleMPG])

	const handleChange = (e) => {
		const name = e.target.name;
		let value = e.target.value;
		if (value === "") value = null;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		//Check validity
		let valid = true;
		//Trip Number
		if (formData.trip_num <= 0)
		{
			let tripNumBox = document.getElementById('tripNum');
			tripNumBox.setCustomValidity("Value must be greater than 0.");
			tripNumBox.reportValidity();
			valid = false;
		}

		if (valid)
		{
			axios.put(`${getBackendURL()}/user/${userData.user_id}`, {...formData}, {withCredentials: true}).then((res) => {
				toast.success('Profile updated successfully', toastSuccess);
				onUserChange(userData);
			}).catch(error => {
				console.error('Error updating profile:', error);
				toast.error('Failed to update profile', toastError);
			});
		}
		
	}

	return (
		<div className='text-start' style={{ maxWidth: '750px', margin: "auto" }}>
			<h2>Profile</h2>
			<hr />
			<h3>Account Information</h3>
			<br />
			<Form onSubmit={handleSubmit}>
				<Col>
					<Row>
						<Col lg={9} sm={8} xs={12}>
							<Form.Group className="text-start mb-lg-3">
								<Form.Label>Email Address</Form.Label>
								<Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} disabled={true} />
							</Form.Group>
						</Col>
						<Col className="text-start mb-3">
							<Form.Group>
							<Form.Label></Form.Label>
							<br />
							<Button className="mt-lg-2 mt-md-2 mt-sm-2 btn" variant="danger" onClick={() => setDeleteAccountModal(true)}>Delete Account</Button>
							</Form.Group>
						</Col>
						<DeleteAccountModal show={deleteAccountModal} handleClose={() => setDeleteAccountModal(!deleteAccountModal)} user={userData} />
					</Row>
				</Col>
				<hr />
				<div>
				<h3>Calculator Defaults</h3>
				<p>Set default values for blank calculator.</p>
				</div>
				<Row>
					<Col className="mb-3" lg={6}>
						<h4>Travel</h4>
						<Row>
							<Form.Group className="text-start mb-3">
								<Form.Label>Default Location</Form.Label>
								<CalculatorInput placeholder="Ex. 94043" name="zip" isEnabled={false} min={5} max={5} integer={true} value={formData.zip} onChange={handleChange} required={true} tooltip={"Default location used for distance calculations."} />
							</Form.Group>
						</Row>
						<Row>
							<Form.Group className="text-start mb-3">
								<Form.Label>Default State Gas $/Gallon</Form.Label>
								<InputGroup>
									<Form.Select id="selectState" name="default_state" value={formData.default_state} onChange={handleChange}>
										<option key={"custom"} value={"custom"}>Custom</option>
										<option key={"average_gas"} value={"average_gas"}>Average</option>
										{gasPrices ? Object.keys(gasPrices).map((element) => {if (element.length == 2) return <option key={element} value={element}>{element}</option>}) : ""}
									</Form.Select>
									<FormNumber id='gasPricePerGallon' maxValue={9.99} value={gasPricePerGallon} placeholder="Ex. 3.21" integer={false} disabled={formData.default_state !== "custom"} onChange={e => setGasPricePerGallon(e.target.value)} required={formData.default_state === "custom"} />
									<TooltipButton text="Default location used for distance calculations. Select Custom to input value instead."/>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row>
							<Form.Group className="text-start mb-3">
								<Form.Label>Default Vehicle Type MPG</Form.Label>
								<InputGroup>
									<Form.Select id="selectVehicleType" name="default_vehicle" value={formData.default_vehicle} onChange={handleChange}>
										<option key={"custom"} value={"custom"}>Custom</option>
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
									<FormNumber id="vehicleMPG" max={99.9} value={vehicleMPG} placeholder="Ex. 20" integer={false} disabled={formData.default_vehicle !== "custom"} onChange={e => setVehicleMPG(e.target.value)} required={formData.default_vehicle === "custom"}/>
									<TooltipButton text='Default Vehicle Type, will determine MPG values used. Choose <i>Average</i> for average MPG value. Select Custom to input your own value (i.e. if you know the exact MPG of your vehicle).'/>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row>
							<CalculatorInput id="mileage_covered" isMoney={true} label={"Mileage Covered (in $ per mile)"} isEnabled={false} maxValue={999.99} value={formData.mileage_covered} placeholder="Ex. 0.21" integer={false} onChange={e => setFormDataValue("mileage_covered", e.target.value)} tooltip={"Default number of miles that will be covered by organizers. Will subtract from total mileage for final result."}/>
						</Row>
						<Row className='mt-3'>
							<TripNumber customTripNum={customTripNum} setCustomTripNum={setCustomTripNum} tripNumSelect={tripNumSelect} setTripNumSelect={setTripNumSelect} setFormDataValue={setFormDataValue} />
						</Row>
						<Row className='mt-3'>
							<CalculatorInput id="travel_fees" isMoney={true} label={"Additional Travel Costs"} isEnabled={false} maxValue={99999.99} value={formData.travel_fees} placeholder="Ex. 4.50" integer={false} onChange={e => setFormDataValue("travel_fees", e.target.value)} tooltip={"Default additional travel fees (i.e. tolls, parking). This field can also be used to input flat-rate travel costs (such as public transit fares, taxi, ridesharing etc.). This field will be multiplied by <i>Number of gigs</i>, but not <i>Trip Number</i>."}/>
						</Row>
					</Col>
					<Col className="mb-3" lg={6}>
						<h4>Basic Information</h4>
						<Row>
							<InputGroup>
								<Button style={{width: "91%"}} variant='outline-dark' onClick={() => {setGigNumModalOpen(!gigNumModalOpen)}}>Number of Gig Options</Button>
								<TooltipButton style={{width: "9%"}} text='Default settings for Number of Gigs Options. Used if you have multiple of the same gig or service.'/>
							</InputGroup>
							<GigOptionsModal show={gigNumModalOpen} onHide={() => {setGigNumModalOpen(false);}} setFormDataValue={setFormDataValue} formData={formData}/>
						</Row>
						<br />
						<h4>Additional Hours</h4>
						<Row>
							<CalculatorInput id="practice_hours" label={"Individual Practice Hours"} isEnabled={false} max={999.9} value={formData.practice_hours} placeholder="Ex. 3" integer={false} onChange={e => setFormDataValue("practice_hours", e.target.value)} tooltip={"Default practice hours for event (individually, not including group rehearsal)."}/>
						</Row>
						<Row>
							<CalculatorInput id="rehearsal_hours" label={"Rehearsal Hours"} isEnabled={false} max={999.9} value={formData.rehearsal_hours} placeholder="Ex. 2" integer={false} onChange={e => setFormDataValue("rehearsal_hours", e.target.value)} tooltip={"Default rehearsal hours for event (not including individual practice)."} />
						</Row>
						<br />
						<h4>Other Expenses</h4>
						<Row>
							<CalculatorInput id="tax" preText="%" label={"Income Tax Percentage"} isEnabled={false} value={formData.tax} maxValue={100} placeholder="Ex. 17.5" integer={false} onChange={e => setFormDataValue("tax", e.target.value)} tooltip={"Percentage of income tax. Taken from initial <i>Pay per gig</i> before any other expenses."} />                           
						</Row>
						<Row>
							<CalculatorInput id="fees" label={"Other Fees"} isEnabled={false} isMoney={true} maxValue={9999.99} value={formData.fees} placeholder="Ex. 15.00" integer={false} onChange={e => setFormDataValue("fees", e.target.value)} tooltip={"Any other additional fees (i.e. food, parking, instrument wear etc.) Will be subtracted at the end of the calculation."} />
						</Row>
					</Col>
				</Row>
				<hr />
				<div className='mb-3 text-center'>
					<Button className="btn" size='lg' variant="primary" type="submit">Update Profile</Button>
				</div>
			</Form>
		</div>
	);
}

export default EditProfile;


