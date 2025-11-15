// ModalContext.js

import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

const ModalProvider = ({ children }) => {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <ModalContext.Provider value={{ showModal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export default ModalProvider;
