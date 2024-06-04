import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, handleClose, message, onConfirm, isDelete=false}) => {
	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Confirm Action</Modal.Title>
			</Modal.Header>
			<Modal.Body>{message}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>Cancel</Button>
				<Button  className={isDelete ? "btn" : "btn-dark"} variant={isDelete ? "danger" : "primary"} onClick={onConfirm}> {isDelete ? "Delete" : "Confirm"}</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmationModal;

