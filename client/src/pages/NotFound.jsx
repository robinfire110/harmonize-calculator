import React, {useState} from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Title from "../components/Title";

const NotFound = () => {
    return (
        <Container className="text-center">
            <Title title={"Page Not Found"} />
            <br />
            <h1>Page Not Found</h1>
            <br />
            <br />
            <h4>Apologies, we can't find the page you are looking for.</h4>
            <br />
            <br />
            <h4>Please ensure you have the correct URL or click <Link to="/">here</Link> to return to the home page.</h4>
            <br />
        </Container>
    )
}

export default NotFound