import React, { useState, useEffect } from 'react';
import {Col, Container, Row} from "react-bootstrap";
import EditProfile from '../dashboards/EditProfile';
import Gigs from '../dashboards/Gigs';
import Financials from '../dashboards/Financials';

function UserDash({ userData }) {
	const [selectedContent, setSelectedContent] = useState('');

	const handleLinkClick = (content) => {
		setSelectedContent(content);
	};
	return (
		<Container fluid>
			<Row>
				<Col sm={3} style={{ backgroundColor: '#f8f9fa' }}>
				</Col>
				<Col sm={9} style={{ padding: '20px', flexGrow: 1 }}>
					{selectedContent === 'editProfile' && <EditProfile userData={userData} />}
					{selectedContent === 'gigs' && <Gigs userData={userData} />}
					{selectedContent === 'financials' && <Financials userData={userData} />}
				</Col>
			</Row>
		</Container>
	);
}

export default UserDash;
