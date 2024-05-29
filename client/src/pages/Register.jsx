import React, {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import { Button, ButtonGroup, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import axios from 'axios';
//import '../App.css'
import { getBackendURL, maxBioLength, maxFNameLength, maxLNameLength, toastError } from "../Utils"
import Select from "react-select";
import FormNumber from "../components/FormNumber";
import Title from "../components/Title";
import TooltipButton from "../components/TooltipButton";


const Register = () => {
	const navigate = useNavigate();
	const [values, setValues] = useState({
		email: '',
		password: ''
	});
	const [confirmPassword, setConfirmPassword] = useState("");
	
	useEffect(() => {
	  	console.log(values.password === confirmPassword);
	}, [values.password, confirmPassword])
	
	const generateError = (err) => toast(err, toastError)

	const handleChange = (event) => {
		event.target.setCustomValidity("");
		const { name, value } = event.target;
		setValues({
			...values,
			[name]: value
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			//Check Email
			await axios.get(`${getBackendURL()}/user/email/${values.email}`).then(async (res) => {
				console.log("Email", res.data);
				if (res.data == null)
				{
					//Check Password
					if (values.password === confirmPassword)
					{
						//Set up data
						const registerData = {...values};
						const {data} = await axios.post(`${getBackendURL()}/register`, registerData, {
							withCredentials:true,
						});
						if (data){
							if (data.errors){
								const {email,password} = data.errors;
								if(email){
									generateError(email)
								}else if(password){
									generateError(password)
								}
							}
							else {
								navigate("/");
							}
						}
					}
					else
					{
						//Passwords don't match
						const passwordField = document.getElementById("password");
						passwordField.setCustomValidity("Passwords do not match.");
						passwordField.reportValidity();
						console.error("Password Invalid");
					}
				}
				else
				{
					//Email already exists
					const emailField = document.getElementById("email");
					emailField.setCustomValidity("User with provided email already exists.");
					emailField.reportValidity();
					console.error("Email Invalid");
				}
			});		
		} catch (err){
			console.error(err);
		}
	};

	return (
		<Container style={{width: "50%"}}>
			<Title title="Register"/>
			<h2>Register Account</h2>
			<br />
			<Form onSubmit={handleSubmit}>
				<Col className="m-auto" lg={6}>
					<Row>
						<Form.Group className="text-start mb-3">
							<Form.Label>Email Address<span style={{color: "red"}}>*</span></Form.Label>
							<Form.Control
								type="email"
								placeholder="Enter email"
								id="email"
								name="email"
								value={values.email}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Row>
					<Row>
						<Form.Group className="text-start mb-3">
							<Form.Label>Password<span style={{color: "red"}}>*</span></Form.Label>
							<Form.Control
								type="password"
								placeholder="Enter Password"
								id="password"
								name="password"
								value={values.password}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Row>
					<Row>
						<Form.Group className="text-start mb-3">
							<Form.Label>Confirm Password<span style={{color: "red"}}>*</span></Form.Label>
							<Form.Control
								type="password"
								placeholder="Re-enter Password"
								id="confirmPassword"
								name="password"
								value={confirmPassword}
								onChange={e => {setConfirmPassword(e.target.value); e.target.setCustomValidity("")}}
								required
							/>
						</Form.Group>
					</Row>
				</Col>
				<br />
				<Button className="btn btn-dark" variant="primary" type="submit">Submit</Button>
				<br />
				<br />
				<span>Already have an account? <Link to="/login">Login</Link></span>
				</Form>
				<ToastContainer />
		</Container>
	);
}

export default Register;
