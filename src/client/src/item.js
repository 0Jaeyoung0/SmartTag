import React, {useState, useEffect} from 'react';
import './item.css'

const Item = ({itemData, onItemSelect, selected}) => {

    let containerName;
    if(selected) containerName = 'item-container-selected';
    else if(itemData.searched) containerName = 'item-container-searched';
    else containerName = 'item-container';
    

    const handlerMouseUp = () => {
        console.log(itemData);
        onItemSelect(itemData);
    }

    let imgsrc;
    if(itemData.type == "목재_1") imgsrc = "https://cdn-icons-png.flaticon.com/512/6017/6017753.png";
    if(itemData.type == "목재_2") imgsrc = "https://cdn-icons-png.flaticon.com/512/3275/3275760.png";

    return (
        <div className={containerName} onMouseUp={handlerMouseUp}>
        <div className="item-img">
            <img className="itemImg" src={imgsrc} alt="아이콘" />
        </div>
        <div className="item-detail">
            <div className="item-name">
                {itemData.name}
            </div>
            <div className="item-type">
                <span className="label">종류 </span> {itemData.type}
            </div>
            <div className="item-id">
                <span className="label">ID </span> {itemData.id}
            </div>
            {/* 
            <div className="item-lat">
                <div className="item-lat-label">
                    위도
                </div>
                <div className="item-lat-value">
                    {itemData.latitude}
                </div>
            </div>
            <div className="item-lon">
                경도 {itemData.longitude}
            </div>
            */}
            <div className="item-timestamp">
                <span className="label">시간 </span> {itemData.timestamp}
            </div>
        </div>
    </div>
    )
}

export default Item;