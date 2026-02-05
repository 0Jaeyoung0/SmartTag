import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import './DashboardComponent.css';
import TotalDetailComponent from './totalDetailComponent';
import DatabaseComponent from './DatabaseComponent';
import MyTableComponent from './test';

const DashboardComponent = () => {

    return (
        <div className="dashboard-container">

            <div className="total-detail-container">
                <TotalDetailComponent/>
            </div>

            <div className="untitle-container">

            </div>

            <div className="log-container">
                
            </div>

            <div className="database-container">
                <DatabaseComponent/>
            </div>

            <div className="bottom-p"></div>

        </div>
    )
}

export default DashboardComponent;