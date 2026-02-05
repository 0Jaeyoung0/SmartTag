import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap , useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SearchTableList.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import icon_red from './icon/marker-red-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import axios from 'axios';
import {urlDefault} from './config';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

const highlightIcon = new L.icon({
  iconUrl: icon_red,
});

const MapUpdater = ({position, zoom}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
  }, [position, zoom, map]);
}



const MapComponent = ({onMapMoveEnd, mapCenter, mapZoom, highlightItem}) => {

  const [position, setPosition] = useState([35.505, 129.39]); // 초기 위치
  const [zoom, setZoom] = useState(8);
  const [searchLocation, setSearchLocation] = useState("");
  const [matchedLocation, setMatchedLocation] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [gpsData, setGpsData] = useState([]);
  const [curBoundsGpsData, setCurBoundsGpsData] = useState([]);

  const gpsDataRef = useRef(gpsData);

  const fetchData = async() => {
    try {
      //const response = await axios.get('http://localhost:8080/query/recent_gps',);
      const response = await axios.get(`${urlDefault}/query/recent_gps`);
      if(JSON.stringify(gpsDataRef.current) !== JSON.stringify(response.data)) {
        setGpsData(response.data);
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  console.log('rerendering');

  useEffect(() => {

    fetchData();

    setPosition(mapCenter);
    setZoom(mapZoom);



    const query_interval = setInterval(fetchData, 1000);

    return () => {
      clearInterval(query_interval);
    }
  }, []);

  useEffect(() => {
    gpsDataRef.current = gpsData;
  }, [gpsData]);

  const handleSearch = () => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchLocation}`)
    .then( (res) => res.json() )
    .then( (data) => {
      if (data.length > 0) {
        setMatchedLocation(data);
      }
    });
  }

  const selectMatchedLocation = (index) => {
    const lat = matchedLocation[index].lat;
    const lon = matchedLocation[index].lon;
    setPosition([parseFloat(lat), parseFloat(lon)]);
    setZoom(12);
    setSelectedIndex(-1);
    setMatchedLocation([]);
    setSearchLocation("");
  }


  const handleKeyDown = (event) => {
    if(event.key === 'Enter') {
      if(selectedIndex == -1)
        handleSearch();
      else {
        selectMatchedLocation(selectedIndex);
      }
    }
    if(event.key === 'ArrowDown') {
      setSelectedIndex(prevIndex => Math.min(prevIndex+1, matchedLocation.length-1));
    }
    if(event.key === 'ArrowUp') {
      setSelectedIndex(prevIndex => Math.max(prevIndex-1, 0));
    }
  }

  const MapMoves = () => {
    const map = useMap();
    useEffect(() => {
      if(map) {
        const update = () => {
          const bounds = map.getBounds();
          const northEast = bounds.getNorthEast();
          const southWest = bounds.getSouthWest();
          const boundsData = {
            lonWest: southWest.lng,
            lonEast: northEast.lng,
            latNorth: northEast.lat,
            latSouth: southWest.lat
          }
          
          const boundsGpsData = gpsData.filter(data => {
            if(boundsData.lonWest < data.longitude && data.longitude < boundsData.lonEast &&
              boundsData.latSouth < data.latitude && data.latitude < boundsData.latNorth) {
                return data;
              }
          });
          onMapMoveEnd(boundsGpsData, map.getCenter(), map.getZoom());
        }

        const update_interval = setInterval(update, 1000);
        map.on('moveend', update);
        /*
        map.on('moveend', () => {
          const bounds = map.getBounds();
          const northEast = bounds.getNorthEast();
          const southWest = bounds.getSouthWest();
          const boundsData = {
            lonWest: southWest.lng,
            lonEast: northEast.lng,
            latNorth: northEast.lat,
            latSouth: southWest.lat
          }
          
          const boundsGpsData = gpsData.filter(data => {
            if(boundsData.lonWest < data.longitude && data.longitude < boundsData.lonEast &&
              boundsData.latSouth < data.latitude && data.latitude < boundsData.latNorth) {
                return data;
              }
          });
          onMapMoveEnd(boundsGpsData, map.getCenter(), map.getZoom());


        });*/

        return () => {
          map.off('moveend');
          clearInterval(update_interval);
        }

      }

    });

  }
  
  return (
    <div style={{position: 'releative'}}>
      
      <MapContainer center={[0,0]} zoom={[1]} style={{ height: "87vh", width: "100%" }}>
        <TileLayer
          //url="http://localhost:9999/styles/fiord/{z}/{x}/{y}.png" // tileserver-gl URL
          //url="https://9fab-220-68-54-138.ngrok-free.app/styles/fiord/{z}/{x}/{y}.png"
          url = {`${urlDefault}/styles/fiord/{z}/{x}/{y}.png`}
        />
        <div className="search-location-container">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a location"
            className="search-location-input"
          />
          <button onClick={handleSearch} className="search-location-button">Search</button>
          <ul className="search-list">
            {
              matchedLocation.map((matched, index) => {
                return <li
                          key={index}
                          className={selectedIndex === index ? 'selected' : ''}
                          tabIndex={0}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onMouseUp={() => setSelectedIndex(index)}
                          onClick={() => {
                            selectMatchedLocation(index);
                          }}
                          >{matched.display_name}</li>
              })
            }
          </ul>
        </div>

        <MapUpdater position={position} zoom={zoom} />
        <MapMoves/>

      {gpsData &&
        gpsData.map(data => (
          highlightItem.findIndex((item) => item.id == data.id) == -1 ? 
          (
          <Marker key={data.id} position={[data.latitude, data.longitude]} icon={DefaultIcon}>
            <Popup>
              {data.id}, {data.timestamp}
            </Popup>
          </Marker>)
          :
          (
          <Marker key={data.id} position={[data.latitude, data.longitude]} icon={highlightIcon}>
            <Popup>
              hi
            </Popup>
          </Marker>)
        ))
      }

      </MapContainer>
      
    </div>
    
  );
};

export default MapComponent;