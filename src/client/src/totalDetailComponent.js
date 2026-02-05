import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './totalDetailComponent.css'
import {urlDefault} from './config'

const TotalDetailComponent = () => {
    const [moduleTypeCounts, setModuleTypeCounts] = useState([]);
    const [moduleTotal, setModuleTotal] = useState(0);

    const fetchData = async () => {
        //const res = await axios.get('https://9fab-220-68-54-138.ngrok-free.app/query/total_module');
        const res = await axios.get(`${urlDefault}/query/total_module`);
        //const res = await axios.get('http://localhost:8080/query/total_module');
        setModuleTypeCounts(res.data);
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let sum = 0;
        for(const data of moduleTypeCounts) {
            sum += data['count(*)'];
        }
        setModuleTotal(sum);
    }, [moduleTypeCounts]);

    return (
        <div>
            <div className="title-container">
                자재 재고 현황
            </div>
            <div className="total-container">
                <span className="total-container-front">총ㅤ</span>
                <span className="total-container-value">{moduleTotal}</span>
                <span className="total-container-front"> EA</span>
            </div>
            <div className="detail-container">
                {
                    moduleTypeCounts.map((data) => {
                        let imgsrc;
                        if(data.type == "목재_1") imgsrc = "https://cdn-icons-png.flaticon.com/512/6017/6017753.png";
                        if(data.type == "목재_2") imgsrc = "https://cdn-icons-png.flaticon.com/512/3275/3275760.png";
                        
                        return (
                            <div className="detail-container-item">
                                <img class="detail-container-icon" src={imgsrc} width="20px" height="20px"/>
                                <div className="detail-container-type">
                                    {data['type']}
                                </div>
                                <div className="detail-container-count">
                                    {data['count(*)']} EA
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default TotalDetailComponent;