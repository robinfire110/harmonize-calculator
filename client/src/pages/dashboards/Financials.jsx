import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getTotalFinHours, saveSpreadsheetAll } from '../../Utils';
import ConfirmationModal from './ConfirmationModal';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import moment from 'moment';

function Financials({ financials, onDeleteFinancial }) {
	const [searchQuery, setSearchQuery] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [filteredFinancials, setFilteredFinancials] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [financialToDelete, setFinancialToDelete] = useState(null);
	const [deleteMessage, setDeleteMessage] = useState('');
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [financialsPerPage, setFinancialsPerPage] = useState(10);
	const navigate = useNavigate();

	useEffect(() => {
		setFilteredFinancials(financials);
	}, [financials]);

	useEffect(() => {
		//Update end date
		if (endDate && startDate > endDate) setEndDate(startDate);

		//Set page
		setCurrentPage(1);

		//Filter results
		const filtered = financials.filter(financial => {
			let search = financial.fin_name.toLowerCase().includes(searchQuery.toLowerCase());
			let date = true;
			if (startDate)
			{
				if (endDate) date = moment(financial.date).isBetween(moment(startDate).subtract(1, "day"), moment(endDate).add(1, "day"));
				else date = moment(financial.date).isSameOrAfter(moment(startDate));
			} 
			
			return search && date;
		});
		setFilteredFinancials(filtered);
	}, [searchQuery, startDate, endDate, financials]);

	//Handle page change
	useEffect(() => {
		resetRowSelect();
	}, [currentPage]);

	const handleRowSelect = (index) => {
		if (selectedRows.includes(index)) {
			setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
		} else {
			setSelectedRows([...selectedRows, index]);
		}
	};

	const handleRowSelectAll = () => {
		//If any are selected, select all
		if (selectedRows.length < 0 || selectedRows.length != currentFinancials.length)
		{
			setSelectedRows([...currentFinancials.keys()]);
		}
		else
		{
			setSelectedRows([]);
		}
	};

	const resetRowSelect = () => {
		setSelectedRows([]);
	}

	const handleCreateNewCalc = () => {
		navigate('/calculator');
	};

	const handleExportAllToSpreadsheet = () => {
		const selectedData = filteredFinancials.filter((financial, index) => selectedRows.includes(index));
		if (selectedData.length > 0) {
			saveSpreadsheetAll(selectedData);
		} else {
			alert("No rows selected for export.");
		}
	};

	const handleExportToSpreadsheet = () => {
		selectedRows.forEach(index => {
			const selectedData = [filteredFinancials[index]];
			saveSpreadsheetAll(selectedData, selectedData[0].fin_name);
		});
	};

	const handleDeleteFinancial = (financial) => {
		setFinancialToDelete(financial);
		setDeleteMessage(`Are you sure you want to delete '${financial.fin_name}' record?`);
		setShowConfirmationModal(true);
	};

	const handleConfirmDeleteFinancial = () => {
		if (financialToDelete) {
			onDeleteFinancial(financialToDelete);
			setFinancialToDelete(null);
			setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== financialToDelete.index));
		}
		setShowConfirmationModal(false);
	};

	const handleRowClick = (financial) => {
		navigate(`/calculator/${financial.fin_id}`);
	};

	const indexOfLastFinancial = currentPage * financialsPerPage;
	const indexOfFirstFinancial = indexOfLastFinancial - financialsPerPage;
	const currentFinancials = filteredFinancials.slice(indexOfFirstFinancial, indexOfLastFinancial);


	return (
		<div>
			<Row>
				<Col lg={4} sm={12} xs={12}>
					<div className='text-start'>
						<h2>Financials</h2>
						<br />
						<h5>Select records to export</h5>
					</div>
				</Col>
				<Col>
					<div className="text-lg-end text-md-start text-sm-start text-xs-start" style={{textAlign: "left"}}>
						<Button className="my-1 me-2 btn btn-dark" variant="primary" onClick={handleCreateNewCalc}>Create New Financial</Button>
						<Button className="my-2" variant="success" onClick={handleExportAllToSpreadsheet} disabled={selectedRows.length === 0}>Export Selected to Spreadsheet</Button>
					</div>
				</Col>
			</Row>
			<Row style={{ marginTop: '20px', marginBottom: '10px', width: '100%'}}>
				<Col className="mb-1 text-start" lg={{order: 0, span: 3}} xs={{order: 3, span: 6}}>
					<Button onClick={handleRowSelectAll}>Select All </Button>
				</Col>
				<Col className="mb-1" lg={5} xs={12}>
					<input
						type="text"
						placeholder="Search financials..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							width: '100%',
							padding: '8px',
							paddingLeft: '30px',
							borderRadius: '20px',
							border: '1px solid #ced4da',
						}}
					/>
				</Col>
				<Col className="mb-1" lg={2} xs={6}>
					<Form.Control type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
				</Col>
				<Col className="mb-1" lg={2} xs={6}>
					<Form.Control type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate}/>
				</Col>
			</Row>
			{filteredFinancials.length > 0 ? (
			<Table striped bordered hover responsive>
				<thead>
				<tr>
					<th>Select</th>
					<th>Date</th>
					<th>Name</th>
					<th>Total Hours</th>
					<th>Hourly Wage</th>
					<th>Action</th>
				</tr>
				</thead>
				<tbody>
				{currentFinancials.map((financial, index) => (
					<tr key={index} style={{ cursor: 'pointer' }}>
						<td onClick={() => handleRowSelect(index)}><input type="checkbox" checked={selectedRows.includes(index)} onChange={() => handleRowSelect(index)} /></td>
						<td onClick={() => handleRowClick(financial)}>{moment(financial.date).format("M/DD/YYYY")}</td>
						<td onClick={() => handleRowClick(financial)}>{financial.fin_name}</td>
						<td onClick={() => handleRowClick(financial)}>{getTotalFinHours(financial).toFixed(2)}</td>
						<td onClick={() => handleRowClick(financial)}>${financial.hourly_wage.toFixed(2)}</td>
						<td>
							<Button variant="danger" style={{ marginRight: '5px' }} onClick={(e) => { e.stopPropagation(); handleDeleteFinancial(financial); }}>Delete</Button>
						</td>
					</tr>
				))}
				</tbody>
			</Table>
			) : (
				<div className="no-financials-message">
					<p>No financial records to show.</p>
				</div>
			)}
			<Row className="justify-content-center">
				<Col lg={{offset: 1}} md={{offset: 1}} sm={{offset: 4}} xs={{offset: 3}}>
					<PaginationControl page={currentPage} total={filteredFinancials.length} limit={financialsPerPage} changePage={(page) => {setCurrentPage(page)}} ellipsis={1}/>
				</Col>
				<Col lg={1} sm={1} xs={1}>
					<Form.Select className="float-right" value={financialsPerPage} style={{width: "5rem", float: "right"}} onChange={(e) => {setFinancialsPerPage(e.target.value); setCurrentPage(1); resetRowSelect();}}>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={9999}>All</option>
					</Form.Select>
				</Col>
			</Row>
			
			<ConfirmationModal
				show={showConfirmationModal}
				handleClose={() => setShowConfirmationModal(false)}
				message={deleteMessage}
				onConfirm={handleConfirmDeleteFinancial}
			/>
		</div>
	);
}

export default Financials;

