import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Tab, Tabs, Table, Row, Col, Form, Container} from "react-bootstrap";
import ConfirmationModal from '../../components/ConfirmationModal';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import axios from 'axios';
import { getBackendURL, toastError } from '../../Utils';
import { toast } from 'react-toastify';
import SimpleBar from 'simplebar-react';

function AdminActions({ userData, refreshData }) {
    const [stats, setStats] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isPromoting, setIsPromoting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        //Check for status
        axios.get(`${getBackendURL()}/account`, { withCredentials: true }).then(res => {
            if (res.data.user.isAdmin)
            {
                //Get Stats
                axios.get(`${getBackendURL()}/user/stats`, { withCredentials: true }).then(res => {
                    setStats(res.data);
                    setIsLoading(false);
                }).catch((error) => {
                    navigate('/account');
                });
            }
            else
            {
                navigate('/account');
            }
        });      
    }, [])

    useEffect(() => {
        setFilteredUsers(userData);
    }, [userData]);

    useEffect(() => {
        //Set page
        setCurrentPage(1);

        const filtered = userData.filter(user =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchQuery, userData]);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePromoteUser = (user) => {
        setActionToConfirm(() => () => onPromoteUser(user));
        setConfirmationMessage(`Are you sure you want to promote ${user.email} to Admin?`);
        setShowConfirmationModal(true);
    };

    const onPromoteUser = (user) => {
        if (!isPromoting)
        {
            setIsPromoting(true);
            axios.put(`${getBackendURL()}/user/${user.user_id}`, {isAdmin: 1}, { withCredentials: true }).then((res) => {
                refreshData();
                setIsPromoting(false);
                setShowConfirmationModal(false);
            }).catch((error) => {
                console.log(error);
                toast("An error occured promoting user.", toastError);
                setIsPromoting(false);
            });
        }
    }

    const handleDemoteUser = (user) => {
        setActionToConfirm(() => () => onDemoteUser(user));
        setConfirmationMessage(`Are you sure you want to demote ${user.email} from Admin?`);
        setShowConfirmationModal(true);
    };

    const onDemoteUser = (user) => {
        if (!isPromoting)
        {
            setIsPromoting(true);
            axios.put(`${getBackendURL()}/user/${user.user_id}`, {isAdmin: 0}, { withCredentials: true }).then((res) => {
                refreshData();
                setIsPromoting(false);
                setShowConfirmationModal(false); 
            }).catch((error) => {
                console.log(error);
                toast("An error occured demoting user.", toastError);
                setIsPromoting(false);
            });  
        }
        
    }

    const handleConfirmation = () => {
        if (actionToConfirm) {
            actionToConfirm();
            setActionToConfirm(null);
        }
    };

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    //const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (!isLoading)
    {
    return (
        <div>
            <Tabs defaultActiveKey="users" id="admin-actions-tabs" onSelect={() => {setCurrentPage(1)}}>
                <Tab eventKey="users" title="Users">
                    <div style={{ marginTop: '20px', marginBottom: '20px', width: '65%'}}>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                paddingLeft: '30px',
                                borderRadius: '20px',
                                border: '1px solid #ced4da',

                        }}
                        />
                    </div>
                    <SimpleBar style={{maxHeight: "610px"}}>
                        <Table className='text-center' striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>User Type</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.user_id} style={{ cursor: 'pointer' }}>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.is_admin ? 'Admin' : 'User'}</td>
                                    <td>
                                        {user.is_admin ? (
                                            <Button variant="warning" style={{ marginRight: '5px' }} onClick={(e) => { e.stopPropagation(); handleDemoteUser(user); }}>Demote</Button>
                                        ) : (
                                            <Button variant="primary" style={{ marginRight: '5px' }} onClick={(e) => { e.stopPropagation(); handlePromoteUser(user); }}>Promote</Button>
                                        )}
                                        <Button variant="danger" style={{ marginRight: '5px' }} onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setShowDeleteModal(true); }}>Delete</Button>

                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </SimpleBar>

                    <Row className="justify-content-center">
                        <Col lg={{offset: 1}} sm={{offset: 1}} xs={{offset: 1}}>
                            <PaginationControl page={currentPage} total={filteredUsers.length} limit={itemsPerPage} changePage={(page) => {setCurrentPage(page)}} ellipsis={1}/>
                        </Col>
                        <Col lg={1} sm={1} xs={1}>
                            <Form.Select className="float-right" value={itemsPerPage} style={{width: "5rem", float: "right"}} onChange={(e) => {setItemsPerPage(e.target.value); setCurrentPage(1); }}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={9999}>All</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="stats" title="Stats">
                    <Container className='text-start'>
                    <br />
                    <h3>Harmonize Stats</h3>
                    <hr />
                    <Col>
                        <Row>
                            <Col xs={6}><h5>Number of Users:</h5></Col>
                            <Col><h5>{stats?.user_count}</h5></Col>
                        </Row>
                        <Row>
                            <Col xs={6}><h5>Number of Saved Calculations:</h5></Col>
                            <Col><h5>{stats?.fin_count}</h5></Col>
                        </Row>
                        <Row>
                            <Col xs={6}><h5>Average Saved Calculations per User</h5></Col>
                            <Col><h5>{stats?.average_fin}</h5></Col>
                        </Row>
                    </Col>
                    </Container>
                </Tab>
            </Tabs>
            <ConfirmationModal
                show={showConfirmationModal}
                handleClose={() => setShowConfirmationModal(false)}
                message={confirmationMessage}
                onConfirm={handleConfirmation}
                isLoading={isPromoting}
            />
            <DeleteAccountModal show={showDeleteModal} handleClose={() => {setShowDeleteModal(!showDeleteModal); setUserToDelete(null);}} user={userToDelete} />
        </div>
    );
    }
}

export default AdminActions;


