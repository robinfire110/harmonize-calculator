import React, { useState, useEffect } from 'react';
import {Form, Button, Container, Col, Row, InputGroup, Modal, Card, ButtonGroup, ToggleButton} from 'react-bootstrap';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import {getBackendURL, maxBioLength, maxFNameLength, maxLNameLength, parseBool, parseFloatZero, parseIntZero} from "../../Utils";
import UserPasswordResetModal from "../dashboards/UserPasswordResetModal";
import FormNumber from '../../components/FormNumber';
import TooltipButton from '../../components/TooltipButton';

function EditProfile({ userData,  onUserChange }) {
	const [formData, setFormData] = useState({
		email: userData.email,
		zip: userData.zip || "",
		default_state: userData.default_state,
		default_gas_price: userData.default_gas_price || null,
		default_vehicle: userData.default_vehicle,
		default_mpg: userData.default_mpg || null,
		default_miles_covered: userData.default_miles_covered || null,
		default_practice: userData.default_practice || null,
		default_rehearsal: userData.default_rehearsal || null,
		default_tax: userData.default_tax || null,
		default_fees: userData.default_fees || null,
		round_trip: userData.round_trip,
		multiply_pay: userData.multiply_pay,
		multiply_hours: userData.multiply_hours,
		multiply_travel: userData.multiply_travel,
		multiply_practice: userData.multiply_practice,
		multiply_rehersal: userData.multiply_rehearsal,
		multiply_other: userData.multiply_other
	});

	//States
    const [isRoundTrip, setIsRoundTrip] = useState(parseBool(userData.round_trip));
    const [gasPricePerGallon, setGasPricePerGallon] = useState(userData.default_gas_price || null);
    const [vehicleMPG, setVehicleMPG] = useState(userData.default_mpg || null);
	const [gasPrices, setGasPrices] = useState();

	//Modal
	const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
	const [gigNumModalOpen, setGigNumModalOpen] = useState(false);

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
		});
	}

	useEffect(() => {
		setFormData({ ...formData, ["default_gas_price"]: parseFloatZero(gasPricePerGallon) });
	}, [gasPricePerGallon])
	
	useEffect(() => {
		setFormData({ ...formData, ["default_mpg"]: parseFloatZero(vehicleMPG) });
	}, [vehicleMPG])

	useEffect(() => {
		setFormData({ ...formData, ["round_trip"]: parseIntZero(isRoundTrip) });
	}, [isRoundTrip])

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	useEffect(() => {
		console.log("userData", userData);
		console.log("FormData", formData);
	}, [formData]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(userData);
		try {
			const response = await axios.put(`${getBackendURL()}/user/${userData.user_id}`, {
				...formData
			}, {
				withCredentials: true
			});
			if (response.data.success) {
				onUserChange(userData);
				toast.success('Profile updated successfully' , { theme: 'dark' });
			} else {
				toast.error('Failed to update profile', { theme: 'dark' });
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Failed to update profile');
		}
	};

	const togglePasswordResetModal = () => {
		setShowPasswordResetModal(!showPasswordResetModal);
	};

	return (
		<div className='text-start' style={{ maxWidth: '650px', margin: "auto" }}>
			<h2>Profile</h2>
			<hr />
			<h3>Account Information</h3>
			<br />
			<Form onSubmit={handleSubmit}>
				<Col>
					<Row>
						<Col lg={6} sm={12}>
							<Form.Group className="text-start mb-3">
								<Form.Label>Email Address<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleChange} required />
							</Form.Group>
						</Col>
						<Col className="text-start mb-3">
							<Form.Label>Password<span style={{color: "red"}}>*</span></Form.Label>
							<InputGroup>
								<Form.Control type="password" placeholder="Password" name="password" value={"greatpassword"} onChange={handleChange} disabled={true} />
								<Button className="btn btn-dark" variant="secondary" onClick={togglePasswordResetModal}>Update Password</Button>
							</InputGroup>
						</Col>
					</Row>
				</Col>
				<hr />
				<div>
				<h3>Calculator Defaults</h3>
				<p>Set default values for blank calculator.</p>
				</div>
				<Row>
					<Col lg={6}>
						<h4>Travel</h4>
						<Row>
							<Form.Group className="text-start mb-3">
								<Form.Label>Default Location</Form.Label>
								<InputGroup>
								<FormNumber placeholder="Ex. 27412" name="zip" min={5} max={5} integer={true} value={formData.zip} onChange={handleChange} required />
								<TooltipButton text="Default location used for distance calculations."/>
								</InputGroup>
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
									<FormNumber id='gasPricePerGallon' maxValue={9.99} value={gasPricePerGallon} placeholder="Ex. 0.14" integer={false} disabled={formData.default_state != "custom"} onChange={e => setGasPricePerGallon(e.target.value)} />
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
									<FormNumber id="vehicleMPG" max={99.9} value={vehicleMPG} placeholder="Ex. 20" integer={false} disabled={formData.default_vehicle != "custom"} onChange={e => setVehicleMPG(e.target.value)} />
									<TooltipButton text='Default Vehicle Type, will determine MPG values used. Choose <i>Average</i> for average MPG value. Select Custom to input your own value (i.e. if you know the exact MPG of your vehicle).'/>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row>
							<Form.Label>Mileage Covered (in $ per mile)</Form.Label>
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<FormNumber id="mileageCovered" name='default_miles_covered' maxValue={999.99} value={formData.default_miles_covered} placeholder="Ex. 0.21" integer={false} onChange={handleChange} />
								<TooltipButton text="Default number of miles that will be covered by organizers. Will subtract from total mileage for final result."/>
							</InputGroup>
						</Row>
						<Row className='mt-3'>
							<Form.Label>Trip Type</Form.Label>
							<ButtonGroup>
								<ToggleButton type="radio" variant="outline-primary" name='round_trip' value={0} checked={formData.round_trip === 0} onClick={() => setIsRoundTrip(0)}>One-Way</ToggleButton>
								<ToggleButton type="radio" variant="outline-primary" name='round_trip' value={1} checked={formData.round_trip === 1} onClick={() => setIsRoundTrip(1)}>Round Trip</ToggleButton>
								<TooltipButton text="Default value that detemines whether mileage is counted as one-way or a round trip. Selecting round trip will muliply travel hours and cost by 2."/>
							</ButtonGroup>
						</Row>
					</Col>
					<Col lg={6}>
						<h4>Basic Information</h4>
						<Row>
							<InputGroup>
								<Button variant='light' onClick={() => {setGigNumModalOpen(!gigNumModalOpen)}}>Number of Gig Options</Button>
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
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_pay"]: parseBool(e.target.checked) })} checked={formData.multiply_pay}></Form.Check></Col>
															<Col><div>Multiply Pay</div></Col>
														</Row>
														<Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_hours"]: parseBool(e.target.checked) })} checked={formData.multiply_hours}></Form.Check></Col>
															<Col><div>Multiply Gig Hours</div></Col>
														</Row>
														<Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_travel"]: parseBool(e.target.checked) })} checked={formData.multiply_travel}></Form.Check></Col>
															<Col><div>Multiply Travel</div></Col>
														</Row>
														<Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_practice"]: parseBool(e.target.checked) })} checked={formData.multiply_practice}></Form.Check></Col>
															<Col><div>Multiply Individual Practice Hours</div></Col>
														</Row>
														<Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_rehearsal"]: parseBool(e.target.checked) })} checked={formData.multiply_rehersal}></Form.Check></Col>
															<Col><div>Multiply Rehearsal Hours</div></Col>  
														</Row>
														<Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
															<Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={(e) => setFormData({ ...formData, ["multiply_other"]: parseBool(e.target.checked) })} checked={formData.multiply_other}></Form.Check></Col>
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
						</Row>
						<br />
						<h4>Additional Hours</h4>
						<Row>
							<Form.Label>Individual Practice Hours</Form.Label>
							<InputGroup>
							<FormNumber id="practiceHours" name="default_practice" max={999.9} value={formData.default_practice} placeholder="Ex. 3" integer={false} onChange={handleChange} />
							<TooltipButton text="The total hours spent practicing for event (individually, not including group rehearsal)."/>
							</InputGroup>
						</Row>
						<Row>
							<Form.Label>Rehearsal Hours</Form.Label>
							<InputGroup>
							<FormNumber id="rehearsalHours" name='default_rehearsal' max={999.9} value={formData.default_rehearsal} placeholder="Ex. 2" integer={false} onChange={handleChange} />
							<TooltipButton text="The total hours spent in rehearsal for event (not including individual practice)."/>
							</InputGroup>
						</Row>
						<br />
						<h4>Other Expenses</h4>
						<Row>
							<Form.Label>Income Tax Percentage</Form.Label>
							<InputGroup>
								<InputGroup.Text>%</InputGroup.Text>
								<FormNumber id="tax" name='default_tax' value={formData.default_tax} maxValue={100} placeholder="Ex. 17.5" integer={false} onChange={handleChange} />
							<TooltipButton text='Percentage of income tax. Taken from initial <i>Pay per gig</i> before any other expenses.'/>
							</InputGroup>
						</Row>
						<Row>
							<Form.Label>Other Fees</Form.Label>
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<FormNumber id="otherFees" name='default_fees' maxValue={9999.99} value={formData.default_fees} placeholder="Ex. 15.00" integer={false} onChange={handleChange} />
								<TooltipButton text="Any other additional fees (i.e. food, parking, instrument wear etc.) Will be subtracted at the end of the calculation."/>
							</InputGroup>
						</Row>
					</Col>
				</Row>

				<hr />
				<div className='text-center'>
				<Button className="btn btn-dark" variant="primary" type="submit">
					Update Profile
				</Button>
				</div>
			</Form>
			<UserPasswordResetModal
				show={showPasswordResetModal}
				handleClose={togglePasswordResetModal}
				isAdmin={false}
			/>
		</div>
	);
}

export default EditProfile;


