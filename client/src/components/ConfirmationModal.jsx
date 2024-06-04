import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BarLoader } from 'react-spinners';

const ConfirmationModal = ({ show, handleClose, message, onConfirm, isDelete=false, isLoading=false}) => {
	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Confirm Action</Modal.Title>
			</Modal.Header>
			<Modal.Body>{message}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>Cancel</Button>
				<Button className={isDelete ? "btn" : "btn-dark"} variant={isDelete ? "danger" : "primary"} onClick={onConfirm}>{isLoading ? <BarLoader color="#FFFFFF" height={4} /> : isDelete ? "Delete" : "Confirm"}</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmationModal;

