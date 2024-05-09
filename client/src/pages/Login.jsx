import React, {useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../App.css';
import {getBackendURL, toastError} from "../Utils";
import Title from "../components/Title";

const Login = () => {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: '',
        password: '',
    });

    const generateError = (err) => toast("Login failed. Please ensure email and password are correct.", toastError)

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
            const {data} =  await axios.post(`${getBackendURL()}/login`, {
                ...values,
            }, {
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
            console.log(err);
        }
    };

    return (
        <div>
            <Title title="Login"/>
            <div className="login-container">
                <div className="container-login" style={{ maxWidth: '600px' }}>
                    <h2>Login</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Button className="btn btn-dark" variant="primary" type="submit">
                            Submit
                        </Button>
                        <br />
                        <br />
                        <span>Want to join? <Link to="/register">Register</Link></span>
                    </Form>
                    <ToastContainer></ToastContainer>
                </div>
            </div>

        </div>
    )
}
export default Login