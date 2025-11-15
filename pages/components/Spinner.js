// components/Spinner.js
import React from 'react';
import styles from './Spinner.module.css'; // CSS module for styling

const Spinner = () => (
    <div className={styles.spinnerOverlay}>
        <div className={styles.spinnerContainer}></div>
    </div>
);

export default Spinner;
