import React, { useState, useEffect } from 'react';
import {Form, Button, Container, Col, Row, InputGroup} from 'react-bootstrap';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import {getBackendURL, maxBioLength, maxFNameLength, maxLNameLength} from "../../Utils";
import UserPasswordResetModal from "../dashboards/UserPasswordResetModal";
import Select from "react-select";
import FormNumber from '../../components/FormNumber';

function EditProfile({ userData,  onUserChange }) {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		zip: '',
		bio: ''
	});
	const [bioLength, setBioLength] = useState(maxBioLength);

	const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
	const [instruments, setInstruments] = useState([])
	const [selectedInstruments, setSelectedInstruments] = useState([])

	const generateError = (err) => toast.error(err, {
		position: "bottom-right",
	})

	useEffect(() => {
		axios.get(`${getBackendURL()}/instrument/`).then(async (res) => {
			setInstruments(res.data);
		}).catch(error => {
			console.error(error);
		});
	}, []);

	useEffect(() => {
		if (userData) {
			setFormData(prevFormData => ({
				...prevFormData,
				email: userData.email || '',
				password: '', //For now, it's better to have this empty than the giant hash.
				name: userData.name || '',
				zip: userData.zip || '',
				bio: userData.bio || ''
			}));
			
			//Set instruments
			const instrumentList = [];
			userData.Instruments.forEach(instrument => {
				instrumentList.push({ value: instrument.instrument_id, label: instrument.name });
			});
			if (instrumentList.length > 0) setSelectedInstruments(instrumentList);
		}
	}, [userData]);

	useEffect(() => {
		//Update bio length
		const bioBox = document.getElementById("bio");
		if (bioBox)
		{
			setBioLength(maxBioLength-bioBox.value.length);
		} 
	}, [formData]);

	const configureInstrumentList = (data) => {
		const instrumentOptionList = [];
		data.forEach(instrument => {
			instrumentOptionList.push({ value: instrument.instrument_id, label: instrument.name });
		});
		console.log("InstrumetnOptionList")
		console.log(instrumentOptionList)
		return instrumentOptionList;
	}


	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(userData);
		console.log("Selected instrument IDs:", selectedInstruments.map(instrument => instrument.value));
		try {
			const response = await axios.post(`${getBackendURL()}/account/update_user`, {
				...formData,
				instruments: selectedInstruments.map(instrument => instrument.value)
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
		<div style={{ maxWidth: '600px', margin: "auto" }}>
			<h2>{userData?.name} Profile</h2>
			<br />
			<br />
			<Form onSubmit={handleSubmit}>
				<Col>
					<Row>
						<Col lg={6} sm={12}>
							<Form.Group className="text-start mb-3" controlId="formBasicEmail">
								<Form.Label>Email Address<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="email"
									placeholder="Enter email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
						<Col className="text-start mb-3">
							<Form.Label>Password<span style={{color: "red"}}>*</span></Form.Label>
							<InputGroup controlId="formBasicPassword">
								<Form.Control
									type="password"
									placeholder="Password"
									name="password"
									value={"greatpassword"}
									onChange={handleChange}
									disabled={true}
								/>
								<Button className="btn btn-dark" variant="secondary" onClick={togglePasswordResetModal}>
								Update Password
								</Button>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col lg={6} sm={6} xs={12}>
							<Form.Group className="text-start mb-3" controlId="formBasicName">
								<Form.Label>First Name<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter your name"
									name="name"
									value={formData.name}
									maxLength={maxFNameLength}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group className="text-start mb-3" controlId="formBasicLastName">
								<Form.Label>Last Name<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter your last name"
									name="l_name"
									value={formData.l_name}
									maxLength={maxLNameLength}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col lg={4}>
							<Form.Group className="text-start mb-3" controlId="formBasicLocation">
								<Form.Label>Location<span style={{color: "red"}}>*</span></Form.Label>
								<FormNumber
									placeholder="Ex. 27412"
									name="zip"
									min={5}
									max={5}
									integer={true}
									value={formData.zip}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>

						<Col>
							<Form.Group className="text-start mb-3" controlId="formBasicInstruments">
								<Form.Label>Instruments</Form.Label>
								<Select
									options={configureInstrumentList(instruments)}
									name="instruments"
									isMulti
									onChange={(selectedOptions) => setSelectedInstruments(selectedOptions)}
									value={selectedInstruments}
								/>
							</Form.Group>
						</Col>
					</Row>

					<Form.Group className="text-start mb-3">
						<Form.Label style={{width: '100%'}}>
							<Row>
								<Col lg={10}>Bio</Col>
								<Col className="text-end">{bioLength}/{maxBioLength}</Col>
							</Row>
						</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							placeholder="Enter a short bio"
							maxLength={maxBioLength}
							name="bio"
							id="bio"
							value={formData.bio}
							onChange={handleChange}
						/>
					</Form.Group>
				</Col>
				<Button className="btn btn-dark" variant="primary" type="submit">
					Update Profile
				</Button>
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


