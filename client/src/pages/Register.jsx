import React, {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import axios from 'axios';
//import '../App.css'
import { getBackendURL, maxBioLength, maxFNameLength, maxLNameLength, toastError } from "../Utils"
import Select from "react-select";
import FormNumber from "../components/FormNumber";
import Title from "../components/Title";


const Register = () => {
	const navigate = useNavigate();
	const [instruments, setInstruments] = useState([])
	const [selectedInstruments, setSelectedInstruments] = useState([])
	const [values, setValues] = useState({
		email: '',
		password: '',
		f_name: '',
		l_name: '',
		zip: '',
		instruments: '',
		bio: ''
	});
	const [bioLength, setBioLength] = useState(maxBioLength);

	useEffect(() => {
		axios.get(`${getBackendURL()}/instrument/`).then(async (res) => {
			setInstruments(res.data);
		}).catch(error => {
			console.error(error);
		});
	}, []);

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
	const displaySelectedInstruments = () => {
		console.log("Selected Instruments:", selectedInstruments);
	};

	const configureInstrumentList = (data) => {
		const instrumentOptionList = []
		data.forEach(instrument => {
			instrumentOptionList.push({value: instrument.instrument_id, label: instrument.name});
		});
		return instrumentOptionList
	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			//Set up data
			const registerData = {...values};
			const instruments = [];
			selectedInstruments.forEach((instrument) => {
				instruments.push(instrument.value);
			});
			registerData.instruments = instruments;

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
								<Form.Label>First Name<span style={{color: "red"}}>*</span></Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter your name"
									name="f_name"
									value={values.f_name}
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
									value={values.l_name}
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
									value={values.zip}
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
							value={values.bio}
							onChange={handleChange}
						/>
					</Form.Group>
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
