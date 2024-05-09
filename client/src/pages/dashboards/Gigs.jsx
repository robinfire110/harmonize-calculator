import React, {useEffect, useState} from 'react';
import {Button, Col, Row, Tab, Tabs} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import ProfileEventCard from '../../components/ProfileEventCard';

function Gigs({ userData, gigs, onGigsChange}) {
	const navigate = useNavigate();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [confirmationMessage, setConfirmationMessage] = useState('');
	const [actionToConfirm, setActionToConfirm] = useState(null);

	useEffect(() => {

		if (onGigsChange) {
			onGigsChange(gigs);
		}
	}, [gigs, onGigsChange]);

	const handleWithdrawEvent = (event) => {
		navigate(`/event/${event.event_id}`);
	}

	const handleConfirmation = () => {
		if (actionToConfirm) {
			actionToConfirm();
			setActionToConfirm(null);
		}
		setShowConfirmationModal(false);
	};

	const handleSeeMoreClick = (gig) => {
		navigate(`/event/${gig.event_id}`);
	}

	function truncateText(text, maxLength = 50) {
		if (text.length <= maxLength) {
			return text;
		} else {
			return text.substring(0, maxLength) + '...';
		}
	}

	return (
		<div>
		<div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<h2>Your Gigs</h2>
			<div>
				<Button className="btn btn-dark" variant="primary" onClick={() => navigate(`/eventsearch`)}>Apply to more Gigs!</Button>
			</div>
		</div>
			<Tabs defaultActiveKey="gigs" id="listings-tabs">
				<Tab eventKey="gigs" title="Gigs">
					<h2 className="current-listings-header">Your Upcoming Gigs</h2>
					<Row>
						{gigs
							.filter(gig => gig.is_listed && gig.status === 'accept')
							.map((gig) => (
								<Col lg={4} md={6} sm={12} key={gig.event_id}><ProfileEventCard gig={gig} deleteEnabled={false} unlistEnabled={false} editEnabled={false} /></Col>
							))}
						{gigs.filter(gig => gig.is_listed && gig.status === 'accept').length === 0 && (
							<div className="no-gigs-message">
								<Button className="btn btn-dark" variant="primary" style={{ marginTop: '20px' }} onClick={() => navigate('/eventsearch')}>View all Events</Button>
							</div>
						)}
					</Row>
				</Tab>

				<Tab eventKey="pending" title="Pending">
					<h2 className="current-listings-header">Pending Applications</h2>
					<Row>
						{gigs
							.filter(gig => gig.is_listed && gig.status === 'applied')
							.map((gig) => (
								<Col lg={4} md={6} sm={12} key={gig.event_id}><ProfileEventCard gig={gig} deleteEnabled={false} unlistEnabled={false} editEnabled={false} withdrawEnabled={true} handleWithdrawEvent={handleWithdrawEvent}/></Col>
							))}
						{gigs.filter(gig => gig.is_listed && gig.status === 'applied').length === 0 && (
							<div className="no-gigs-message">
								<p>Nothing to show.</p>
							</div>
						)}
					</Row>
				</Tab>
				<Tab eventKey="closed" title="Closed">
					<h2 className="current-listings-header">Closed Gigs</h2>
					<Row>
						{gigs
							.filter(gig => gig.status === 'withdraw' || gig.status === 'rejected')
							.map((gig) => (
								<Col lg={4} md={6} sm={12} key={gig.event_id}><ProfileEventCard gig={gig} deleteEnabled={false} unlistEnabled={false} editEnabled={false} /></Col>
							))}
						{gigs.filter(gig => gig.status === 'withdraw' || gig.status === 'rejected').length === 0 && (
							<div className="no-gigs-message">
								<p>Nothing to show.</p>
							</div>
						)}
					</Row>
				</Tab>
			</Tabs>
			<ConfirmationModal
				show={showConfirmationModal}
				handleClose={() => setShowConfirmationModal(false)}
				message={confirmationMessage}
				onConfirm={handleConfirmation}
			/>
		</div>
	);
}

export default Gigs;


