import React, { useState, useEffect } from 'react';
import {Form, Button, Container, Col, Row, InputGroup} from 'react-bootstrap';
import {toast, ToastContainer} from 'react-toastify';
import axios from 'axios';
import {getBackendURL, maxBioLength, maxFNameLength, maxLNameLength} from "../../Utils";
import UserPasswordResetModal from "../dashboards/UserPasswordResetModal";
import Select from "react-select";
import FormNumber from '../../components/FormNumber';
import TooltipButton from '../../components/TooltipButton';

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

	const generateError = (err) => toast.error(err, {
		position: "bottom-right",
	})

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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(userData);
		try {
			const response = await axios.post(`${getBackendURL()}/account/update_user`, {
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
		<div className='text-start' style={{ maxWidth: '600px', margin: "auto" }}>
			<h2>Profile</h2>
			<hr />
			<h3>Account Information</h3>
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
								<Form.Label>Name<span style={{color: "red"}}>*</span></Form.Label>
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
					</Row>
				</Col>
				<br />
				<h3>Calculator Defaults</h3>
				<br />
				<Col>
					<Row>
					<Col>
						<Form.Group className="text-start mb-3" controlId="formBasicLocation">
							<Form.Label>Default Location</Form.Label>
							<InputGroup>
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
							<TooltipButton text="Default location used for distance calculations."/>
							</InputGroup>
						</Form.Group>
					</Col>
					</Row>
				</Col>
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


