import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from "react-toastify";
import axios from 'axios';
import { getBackendURL, toastError, toastSuccess } from "../../Utils";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ show, handleClose, user}) => {
	const generateError = (err) => toast(err, toastError)
	const navigate = useNavigate();
	const [confirmText, setConfirmText] = useState("");
	const [,, removeCookie] = useCookies([]);

	const handleConfirm = async () => {
		if (confirmText === "delete")
		{
			axios.delete(`${getBackendURL()}/user/${user.user_id}`, { withCredentials: true }).then((res) => {
				removeCookie("jwt");
				if (window.location.hash !== "#admin")
				{
					navigate("/");
				}
				window.location.reload();
				
			});
		}
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Delete Account Confirmation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>
					By deleting this account, all saved calculator data will be <b>permanently deleted.</b> Please ensure you have exported any data you want to keep. 
					<br />
					<br />
					To confirm the deletion of the account under the email <b>{user?.email}</b>, please type <i>delete</i> below.
				</p>
				<Form.Control placeholder='Type "delete" to confirm.' value={confirmText} onChange={(e) => {setConfirmText(e.target.value)}}/>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>Cancel</Button>
				<Button className="btn" variant="danger" onClick={handleConfirm} disabled={confirmText !== "delete"}>Delete Account</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DeleteAccountModal;
