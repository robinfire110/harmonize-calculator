import React from "react";
import { Nav } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import {toast, ToastContainer} from 'react-toastify';
import { toastSuccess } from "../Utils";

const LogoutButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [,, removeCookie] = useCookies([]);

    const logOut = () => {
        removeCookie("jwt");
        sessionStorage.setItem("isLogout", true);
        window.location.replace("/");
    };

    return (
        <Nav.Item>
            <Nav.Link onClick={logOut}>Logout</Nav.Link>
        </Nav.Item>
    );
};

export default LogoutButton;
