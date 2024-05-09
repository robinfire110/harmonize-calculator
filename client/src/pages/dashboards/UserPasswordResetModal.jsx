import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from "react-toastify";
import axios from 'axios';
import { getBackendURL, toastError, toastSuccess } from "../../Utils";

const PasswordResetModal = ({ show, handleClose, onConfirm }) => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const generateError = (err) => toast(err, toastError)

	const handleConfirm = async () => {
		try {
			if (newPassword !== confirmPassword) {
				generateError("Passwords don't match");
				return;
			}

			const response = await axios.post(`${getBackendURL()}/account/update_password`, {
				oldPassword,
				newPassword,
			},
				{
					withCredentials: true
				});

			if (response.data.success) {
				toast('Password reset successful', toastSuccess);
			} else {
				generateError('Failed to reset password', { theme: 'dark' });
			}

			handleClose();
		} catch (error) {
			console.error('Error resetting password:', error);
			generateError('Failed to reset password');
		}
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Update Password</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Group className="mb-3" controlId="formOldPassword">
					<Form.Label>Old Password</Form.Label>
					<Form.Control type="password" placeholder="Enter old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
				</Form.Group>
				<Form.Group className="mb-3" controlId="formNewPassword">
					<Form.Label>New Password</Form.Label>
					<Form.Control type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
				</Form.Group>
				<Form.Group className="mb-3" controlId="formNewPasswordCheck">
					<Form.Label>Confirm New Password</Form.Label>
					<Form.Control type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Cancel
				</Button>
				<Button className="btn btn-dark" variant="primary" onClick={handleConfirm}>
					Update Password
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PasswordResetModal;
