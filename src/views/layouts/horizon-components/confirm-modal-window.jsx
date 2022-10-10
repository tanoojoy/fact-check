import React from 'react';
import { string, bool, func, oneOfType, arrayOf, node } from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

export const windowSizes = {
    xs: 'modal-30w',
    sm: 'modal-50w',
    lg: 'modal-70w'
};

export const ConfirmModalWindow = ({
    title = '',
    body,
    footer,
    show = false,
    hideModal,
    size = windowSizes.sm,
    blockOutsideClick = false
}) => {
    return (
        <Modal show={show} onHide={hideModal} dialogClassName={size} backdrop={blockOutsideClick ? 'static' : true}>
            <Modal.Header>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                {footer}
            </Modal.Footer>
        </Modal>
    );
};

ConfirmModalWindow.propTypes = {
    title: string,
    show: bool,
    hideModal: func,
    size: string,
    body: oneOfType([
        arrayOf(node),
        node
    ]),
    footer: oneOfType([
        arrayOf(node),
        node
    ]),
    blockOutsideClick: bool
};
