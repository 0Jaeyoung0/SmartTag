import logo from './logo.svg';
import './App.css';
import MapComponent from './MapComponent';
import ItemTab from './itemTab';
import DashboardComponent from './DashboardComponent';
import React, {useState, useEffect} from 'react';


var center = [35,127];
var zoom = 8;


function App() {

  console.log('App rerendering');
  const [mode, setMode] = useState(0); // 0 : 지도 , 1 : DB
  const [boundsGpsData, setBoundsGpsData] = useState([]);
  const [highlightItem, setHighLightItem] = useState([]);
  const [searchedValue, setSearchedValue] = useState('');
  const [searchedOption, setSearchedOption] = useState('id');



  const handleMapMoveEnd = (_boundsGpsData, _mapCenter, _mapZoom) => {
    setBoundsGpsData(_boundsGpsData);
    center = _mapCenter;
    zoom = _mapZoom;
  };

  const handleItemValueSearch = (_searchedValue) => {
    setSearchedValue(_searchedValue);
    console.log(_searchedValue);
  }

  const handleItemOptionSearch = (_searchedOption) => {
    setSearchedOption(_searchedOption);
  }

  const handleItemSelect = (_data) => {
    console.log('handleItemSelect');
    setHighLightItem((prevItem) => {
      // 체크 해제인지 확인
      const find_idx = prevItem.findIndex((item) => item.id == _data.id);
      console.log(prevItem);
      if(find_idx != -1) {
        return prevItem.filter((item, index) => index !== find_idx);
      } else return [...prevItem, _data];
    });
  }

  const MapModeClick = () => {
    console.log('지도 클릭');
    setMode(0);
  }

  const DBModeClick = () => {
    setMode(1);
  }

  

  return (
    <div class="container">

      <div class="top">
        <p class="title">
          자재 관리 시스템
        </p>
      </div>

    <div class="middle">
      <div class="left">
        <div class="mode-container">
          <div class="mode-map" onClick={MapModeClick}>
            　Map
          </div>
          <div class="mode-db" onClick={DBModeClick}>
            　Dashboard
          </div>
        </div>
        
      </div>

      {
        mode == 0 ? 
        <div className="MapContainer">
          <MapComponent onMapMoveEnd = {handleMapMoveEnd} 
                        mapCenter = {center}
                        mapZoom = {zoom}
                        highlightItem = {highlightItem}

          />
        </div>
         :
          <div className="middle-main">
            <DashboardComponent />
          </div>
      }

      {
        mode == 0 ?
        <div class="right">
          <ItemTab curItemData = {boundsGpsData}
                    onItemSelect = {handleItemSelect}
                    selectedItem = {highlightItem}
                    searchedValue = {searchedValue}
                    setSearchedValue = {handleItemValueSearch}
                    searchedOption = {searchedOption}
                    setSearchedOption = {handleItemOptionSearch}
          />
        </div>
        :
        //<div class="middle-right"></div>
        <div></div>
      }
      

      

    </div>

      <div class="bottom">bottom</div>

    </div>

    
  );
}

export default App;
