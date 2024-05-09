import React from "react";
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import {toast, ToastContainer} from 'react-toastify';
import { toastSuccess } from "../Utils";

const LogoutButton = () => {
    const navigate = useNavigate();
    const [,, removeCookie] = useCookies([]);

    const logOut = () => {
        removeCookie("jwt");
        window.location.reload();
        //toast('You have been successfully logged out!', toastSuccess); //Doesn't work with reload.
    };

    return (
        <Nav.Item>
            <Nav.Link onClick={logOut}>Logout</Nav.Link>
        </Nav.Item>
    );
};

export default LogoutButton;
