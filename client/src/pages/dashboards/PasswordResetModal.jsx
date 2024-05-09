import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PasswordResetModal = ({ show, handleClose, message, onConfirm }) => {
	const [newPassword, setNewPassword] = useState('');

	const handlePasswordChange = (event) => {
		setNewPassword(event.target.value);
	};

	const handleConfirm = () => {
		onConfirm(newPassword);
		setNewPassword('');
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Reset Password</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{message}</p>
				<Form.Group controlId="formNewPassword">
					<Form.Label>New Password</Form.Label>
					<Form.Control type="password" placeholder="Enter new password" value={newPassword} onChange={handlePasswordChange} />
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Cancel
				</Button>
				<Button className="btn btn-dark" variant="primary" onClick={handleConfirm}>
					Reset Password
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PasswordResetModal;
