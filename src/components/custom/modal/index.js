import React, { useContext } from 'react';
import { Modal } from 'react-bootstrap'

export default ({ title, children, showModal, handleClose, size }) => {
    return (
        <>
            <Modal
                size={size}
                show={showModal}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                {title && <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h3>{title}</h3>
                    </Modal.Title>
                </Modal.Header>}
                <Modal.Body>
                    {children}
                </Modal.Body>
            </Modal>
        </>
    );
}
