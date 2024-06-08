import React from 'react'
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap'

function GigOptionsModal({show, onHide, setFormDataValue, formData}) {
    return (
        <Modal show={show} onHide={onHide} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>Number of Services Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Choose which attributes get multiplied by number of gigs.
                    <br />
                    <small>Note - If all options are enabled, number of gigs will make no difference because all fields are multiplied by the same amount.</small>
                </p>
                    <Card style={{display:'flex'}}>
                        <Container>
                            <Col>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_pay", !formData.multiply_pay)}} checked={formData.multiply_pay}></Form.Check></Col>
                                    <Col><div>Multiply Pay</div></Col>
                                </Row>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_hours", !formData.multiply_hours)}} checked={formData.multiply_hours}></Form.Check></Col>
                                    <Col><div>Multiply Gig Hours</div></Col>
                                </Row>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_travel", !formData.multiply_travel)}} checked={formData.multiply_travel}></Form.Check></Col>
                                    <Col><div>Multiply Travel</div></Col>
                                </Row>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_practice", !formData.multiply_practice)}} checked={formData.multiply_practice}></Form.Check></Col>
                                    <Col><div>Multiply Individual Practice Hours</div></Col>
                                </Row>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .05)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_rehearsal", !formData.multiply_rehearsal)}} checked={formData.multiply_rehearsal}></Form.Check></Col>
                                    <Col><div>Multiply Rehearsal Hours</div></Col>  
                                </Row>
                                <Row className="py-2 align-items-center" style={{backgroundColor: "rgba(100, 100, 100, .15)"}}>
                                    <Col lg={2} xs={2} className="text-end"><Form.Check type="switch" onChange={() => {setFormDataValue("multiply_other", !formData.multiply_other)}} checked={formData.multiply_other}></Form.Check></Col>
                                    <Col><div>Multiply Other Fees</div></Col>  
                                </Row>
                            </Col>
                        </Container>
                    </Card>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="primary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default GigOptionsModal