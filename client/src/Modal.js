import React from 'react';
import {Button, Container, Modal, Row, Col} from 'react-bootstrap';
import { BsBoxArrowUpRight } from "react-icons/bs"
import './Modal.css';


function MyModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <h5>Your wallet</h5>
            <i className="bi bi-box-arrow-up-right"></i>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="text-truncate address-text">
        {props.account}
        </div>
        <div className="bsc-link-row">
        <a href={"https://bscscan.com/address/"+ props.account} target="_blank" rel="noopener noreferrer" onClick={() => props.onHide(false)} className="bsc-link">View on BscScan <BsBoxArrowUpRight size={20} className="arrow-logo"></BsBoxArrowUpRight></a>
          <p> </p>
        </div>

          
          <Container>
  <Row className="justify-content-center">
    
      <Button onClick={() => props.onHide(true)}className="logout-button">Logout</Button>

  </Row>

</Container>
        </Modal.Body>
      </Modal>
    );
  }

  export default MyModal;