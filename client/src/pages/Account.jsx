import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Spinner from 'react-bootstrap/Spinner';
import {Col, Container, Row} from "react-bootstrap";
import "../App.css";
import EditProfile from "./dashboards/EditProfile";
import Financials from "./dashboards/Financials";
import AdminActions from "./dashboards/AdminActions";
import { getBackendURL } from "../Utils"
import Title from '../components/Title';


function Account() {
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies([]);
    const [userData, setUserData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState('listings');

    const verifyUser = async () => {
        if (!cookies.jwt) 
        {
            navigate('/login');
        } 
        else {
            try {
                const { data } = await axios.get(`${getBackendURL()}/account`, { withCredentials: true });
                axios.get(`${getBackendURL()}/user/id/${data.user.user_id}`, { withCredentials: true }).then(res => {
                    const data = res.data;
                    setUserData(data);
                    setFinancials(data.Financials);
                    setIsAdmin(data.isAdmin);
                });
            } catch (error) {
                removeCookie('jwt');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
            verifyUser();
    }, [cookies, navigate, removeCookie]);

    const fetchUsers = async () => {
        try {
            if(isAdmin){
                const { data } = await axios.get(`${getBackendURL()}/user`, { withCredentials: true });
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [isAdmin]);

    const handleLinkClick = (content) => {
        //Filter
        if (content === "financials") content = "financials";
        if (content === "profile") content = "editProfile";
        if (content === "admin") content = "adminActions";
        setSelectedContent(content);
    };

    const handlePromoteUser = async (user) => {
        try {
            if(isAdmin){
                const response = await axios.put(`${getBackendURL()}/account/admin/promote-user/${user.user_id}`,
                    null,
                    {
                        withCredentials: true
                    });
                if (response.data.success) {
                    toast.success(`Successfully promoted ${user.email} to Admin`, { theme: 'dark' });
                    fetchUsers();
                } else {
                    console.error('Failed to promote user:', response.data.message);
                }
            }
        } catch (error) {
            console.error('Error promoting user:', error);
        }
    };


    const handleDemoteUser = async (user) => {
        try {
            if(isAdmin){
                const response = await axios.put(`${getBackendURL()}/account/admin/demote-user/${user.user_id}`,
                    null ,
                    {
                        withCredentials: true
                    });
                if (response.data.success) {
                    toast.success(`Successfully demoted ${user.email} to user`, { theme: 'dark' });
                    fetchUsers();
                } else {
                    console.error('Failed to demote user:', response.data.message);
                }
            }

        } catch (error) {
            console.error('Error demote user:', error);
        }
    };

    const handleDeleteUser = async (user) => {
        try {
            if(isAdmin){
                const response = await axios.delete(`${getBackendURL()}/account/admin/remove-user/${user.user_id}`
                    , {
                        withCredentials: true
                    });
                if (response.data.success) {
                    toast.success(`Successfully deleted user ${user.email}`, { theme: 'dark' });
                    fetchUsers();
                } else {
                    console.error('Failed to delete user:', response.data.message);
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const renderContent = () => {
        switch(selectedContent) {       
            case 'editProfile':
                return <EditProfile userData={userData}
                                    onUserChange={setUserData} />
            case 'adminActions':
                return <AdminActions userData={ users }
                                 refreshData={fetchUsers}/>;
            default:
                if (window.location.hash != "financials") window.location.hash = "financials";
                return <Financials financials={financials} refreshData={verifyUser}/>;

        }
    };

    if (loading) {
        return <Spinner />;
    }

    const dashboardTitle = isAdmin ? 'Admin Dashboard' : 'User Dashboard';

    return (
        <Container>
        <Row>
            <Col lg={2}>
                <div>
                    <Sidebar handleLinkClick={handleLinkClick} isAdmin={isAdmin} />
                </div>
            </Col>
            <Col>
                <Title title={"Account"} />
                <Container className='justify-content-center'>
                    {selectedContent && renderContent()}
                </Container>
            </Col>
            
        </Row>
        </Container>
    );
}

export default Account;
