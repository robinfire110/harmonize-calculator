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
		password: '',
		name: '',
		zip: ''
	});
	const [bioLength, setBioLength] = useState(maxBioLength);

	//Update bio length
    useEffect(() => {
        const bioBox = document.getElementById("bio");
        if (bioBox)
        {
            setBioLength(maxBioLength-bioBox.value.length);
        } 
    }, [values]);

	const generateError = (err) => toast(err, toastError)

	const handleChange = (event) => {
		const { name, value } = event.target;
		setValues({
			...values,
			[name]: value
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			//Set up data
			const registerData = {...values};
			const {data} = await axios.post(`${getBackendURL()}/register`, registerData, {
				withCredentials:true,
			});
			if(data){
				if(data.errors){
					const {email,password} = data.errors;
					if(email){
						generateError(email)
					}else if(password){
						generateError(password)
					}
				}else{
					navigate("/");
				}
			}
		}catch (err){
			console.error(err);
		}
	};

	return (
		<Container style={{width: "50%"}}>
			<Title title="Register"/>
			<h2>Register Account</h2>
			<br />
			<br />
			<Form onSubmit={handleSubmit}>
				<Col>
					<Row>
						<Col>
							<Form.Group className="text-start mb-3" controlId="formBasicEmail">
								<Form.Label>Email Address<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="email"
									placeholder="Enter email"
									name="email"
									value={values.email}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>

						<Col>
							<Form.Group className="text-start mb-3" controlId="formBasicPassword">
								<Form.Label>Password<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="password"
									placeholder="Password"
									name="password"
									value={values.password}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col>
							<Form.Group className="text-start mb-3" controlId="formBasicName">
								<Form.Label>Name<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter your name"
									name="name"
									value={values.name}
									maxLength={maxFNameLength}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
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
									value={values.zip}
									onChange={handleChange}
									required
								/>
								<TooltipButton text="Default location used for distance calculations."/>
								</InputGroup>
							</Form.Group>
						</Col>
					</Row>
				</Col>
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
