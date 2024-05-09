import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './dashboards/Sidebar';
import Spinner from 'react-bootstrap/Spinner';
import {Button, Card, Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import "../App.css";
import EditProfile from "./dashboards/EditProfile";
import Gigs from "./dashboards/Gigs";
import Financials from "./dashboards/Financials";
import AdminActions from "./dashboards/AdminActions";
import { getBackendURL } from "../Utils"
import Title from '../components/Title';
import Listings from './dashboards/Listings';
import ConfirmationModal from './dashboards/ConfirmationModal';


function Account() {
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies([]);
    const [userData, setUserData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [gigs, setGigs] = useState([]);
    const [users, setUsers] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState('listings');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showUnlistModal, setShowUnlistModal] = useState(false);
    const [eventToUnlist, setEventToUnlist] = useState(null);

    const verifyUser = async () => {
        if (!cookies.jwt) {
            navigate('/login');
        } else {
            try {
                const { data } = await axios.get(`${getBackendURL()}/account`, { withCredentials: true });
                axios.get(`${getBackendURL()}/user/id/${data.user.user_id}`, { withCredentials: true }).then(res => {
                    const data = res.data;
                    setUserData(data);
                    console.log(data);
                    setIsAdmin(data.isAdmin);
                    toast(`Hi ${data.f_name}`, { theme: 'dark', autoClose: 2000 });
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


    const fetchUserGigs = async () => {
        try {
            const { data } = await axios.get(`${getBackendURL()}/account/user-gigs`, { withCredentials: true });
            setGigs(data.userEvents);
        } catch (error) {
            console.error('Error fetching user gigs:', error);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchUserGigs();
        }
    }, [userData]);


    const fetchUserFinancials = async () => {
        try {
            if (!userData || !userData.user_id) {
                console.error('User data or user_id is not available');
                return;
            }
            const { data } = await axios.get(`${getBackendURL()}/account/user-financials`, { withCredentials: true });
            setFinancials(data.userFinancials);
        } catch (error) {
            console.error('Error fetching user financials:', error);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchUserFinancials();
        }
    }, [userData]);

    const fetchUsers = async () => {
        try {
            if(isAdmin){
                const { data } = await axios.get(`${getBackendURL()}/account/admin/all-users`, { withCredentials: true });
                setUsers(data.users);
            }

        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [isAdmin]);

    const fetchPosts = async () => {
        try {
            if(isAdmin){
                const { data } = await axios.get(`${getBackendURL()}/account/admin/all-events`, { withCredentials: true });
                setPosts(data.events);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [isAdmin]);


    const handleLinkClick = (content) => {
        //Filter
        if (content === "admin") content = "adminActions";
        if (content === "profile") content = "editProfile";
        if (content === "applications") content = "gigs";
        setSelectedContent(content);
    };

    const handlePasswordReset = async (user, newPassword) => {
        try {
            if(isAdmin){
                const response = await axios.post(`${getBackendURL()}/account/admin/reset-user-password`,
                    { user, newPassword }, {
                        withCredentials: true
                    });
                if (response.data.success) {
                    toast.success("Password reset successfully", { theme: 'dark' });
                    fetchUsers();
                } else {
                    console.error('Failed to reset password:', response.data.message);
                }
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
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

    const handleDeletePost = async (post) => {
        try {
            const response = await axios.delete(`${getBackendURL()}/account/admin/remove-user-post/${post.event_id}`
                , {
                    withCredentials: true
                });
            if (response.data.success) {
                toast.success(`Successfully deleted post ${post.event_name} by ${post.f_name}`, { theme: 'dark' });
                fetchPosts();
            } else {
                console.error('Failed to delete post:', response.data.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleDeleteFinancial = async (financial) => {
        try {
            console.log(financial.fin_id)
            const response = await axios.delete(`${getBackendURL()}/account/delete-financial/${financial.fin_id}`
                , {
                    withCredentials: true
                });
            if (response.data.success) {
                toast.success(`Successfully deleted ${financial.fin_name}`, { theme: 'dark' });
                fetchUserFinancials();
            } else {
                console.error('Failed to delete financial:', response.data.message);
            }

        } catch (error) {
            console.error('Error deleting financial record:', error);
            toast.error('Failed to delete financial record', { theme: 'dark' });
        } finally {
            handleCloseUnlistModal();
        }
    };

    const handleDeleteEvent = async (event) => {
        try {
            const response = await axios.delete(`${getBackendURL()}/account/delete-event/${event.event_id}`,
                {
                    withCredentials: true
                });
            if (response.data.success) {
                toast.success(`Successfully deleted listing ${event.event_name}`, { theme: 'dark' }, { theme: 'dark' });
                fetchUserGigs();
            } else {
                console.error('Failed to delete listing:', response.data.message);
            }

        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event', { theme: 'dark' });
        } finally {
            handleCloseDeleteModal();
        }
    };

    const handleUnlistEvent = async (event) => {
        try {
            const response = await axios.put(`${getBackendURL()}/account/unlist-event/${event.event_id}`,
                null , {
                    withCredentials: true
                });
            if (response.data.success) {
                toast.success(`Successfully unlisted event ${event.event_name}`, { theme: 'dark' });
                fetchUserGigs();
            } else {
                console.error('Failed to unlist event:', response.data.message);
            }
        } catch (error) {
            console.error('Error unlisting event:', error);
            toast.error('Failed to unlist event', { theme: 'dark' });
        } finally {
            handleCloseUnlistModal();
        }
    };

    const handleShowUnlistModal = (event) => {
        setEventToUnlist(event);
        setShowUnlistModal(true);
    }

    const handleCloseUnlistModal = () => {
        setShowUnlistModal(false);
        setEventToUnlist(null);
    };

    const handleShowDeleteModal = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setEventToDelete(null);
    };

    

    const renderContent = () => {
        switch(selectedContent) {       
            case 'editProfile':
                return <EditProfile userData={userData}
                                    onUserChange={setUserData} />

            case 'gigs':
                return <Gigs userData={userData} gigs={gigs}
                             onGigsChange={setGigs}/>;
            case 'financials':
                return <Financials userData={userData}
                                   financials={financials}
                                   onDeleteFinancial={handleDeleteFinancial}/>;
            case 'adminActions':
                return <
                    AdminActions userData={ users }
                                 postData={ posts }
                                 onPasswordReset={handlePasswordReset}
                                 onPromoteUser={handlePromoteUser}
                                 onDemoteUser={handleDemoteUser}
                                 onDeleteUser={handleDeleteUser}
                                 onDeletePost={handleDeletePost}/>;
            default:
                if (window.location.hash != "listings") window.location.hash = "listings";
            case 'listings':
                return <Listings userData={userData} gigs={gigs}
                                onDeleteEvent={handleDeleteEvent}
                                onUnlistEvent={handleUnlistEvent}
                                handleShowDeleteModal={handleShowDeleteModal}
                                handleCloseDeleteModal={handleCloseDeleteModal}
                                handleShowUnlistModal={handleShowUnlistModal}
                                handleCloseUnlistModal={handleCloseUnlistModal}
                                />;
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
                <ConfirmationModal
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                message="Are you sure you want to delete this event?"
                onConfirm={() => handleDeleteEvent(eventToDelete)}
                />
                <ConfirmationModal
                    show={showUnlistModal}
                    handleClose={handleCloseUnlistModal}
                    message="Are you sure you want to unlist this event?"
                    onConfirm={() => handleUnlistEvent(eventToUnlist)}
                />
            </Col>
            
        </Row>
        </Container>
    );
}

export default Account;

