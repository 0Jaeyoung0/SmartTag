import requests
import serial
import time
from datetime import datetime

import os

headers = {'Content-Type': 'application/json; charset=utf-8'}
cur_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
content = []
config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.txt')
with open(config_path, 'r', encoding='utf-8') as file:
    for line in file:
        content.append(line.strip())
print(content)
url = content[3] + '/test'
url2 = content[3]+'/print'

def get_raspberry_pi_id():
    try:
        with open('/proc/cpuinfo', 'r') as file:
            for line in file:
                if line.startswith('Serial'):
                    return line.strip().split(': ')[1]
    except FileNotFoundError:
        print("Error: Unable to access /proc/cpuinfo")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
id = get_raspberry_pi_id()
if id:
    print(f"Raspberry Pi ID: {id}")
else:
    print("Failed to retrieve Raspberry Pi ID")

def parse_gps_data(gps_raw_data):
    try:
        lines = gps_raw_data.split("\r\n")
        for line in lines:
            if line.startswith("$GPSACP:"):
                parts = line.split(",")
                latitude_raw = parts[1]
                longitude_raw = parts[2]

                latitude = convert_to_decimal(latitude_raw)
                longitude = convert_to_decimal(longitude_raw)

                return latitude, longitude
    except Exception as e:
        print(f"Error parsing GPS data: {e}")
    return None, None

def convert_to_decimal(coord_raw):
    direction = coord_raw[-1]
    coord = coord_raw[:-1]
    degrees = 0
    minutes = 0
    print(coord)
    if len(coord) == 9:
        # latitude
        degrees = int(coord[:2])
        minutes = float(coord[2:])
    if len(coord) == 10:
        # longitude
        degrees = int(coord[:3])
        minutes = float(coord[3:])
    decimal = degrees + (minutes / 60.0)
    if direction in ['S','W']:
        decimal = -decimal
    
    return decimal


id = get_raspberry_pi_id()

while(True):
    cur_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ser = serial.Serial('/dev/ttyUSB3', baudrate=9600, timeout=1)
    ser.write(b'AT$GPSP=1\r\n')
    time.sleep(1)
    ser.write(b'AT$GPSACP\r\n')
    time.sleep(1)
    gps_data = ser.read(ser.in_waiting)
    raw_data = {'content': gps_data.decode('utf-8')}
    try:
        response = requests.post(url2, json=raw_data, headers=headers)
    except requests.exceptions.RequestException as e:
        print(f'Request failed: {e}')

    latitude, longitude = parse_gps_data(gps_data.decode('utf-8'))
    if latitude == None:
        ser.close()
        time.sleep(connection_interval)
        continue
    data = {
        'latitude': latitude, 
        'longitude': longitude,
        'time': cur_time,
        'client_version': content[0],
        'type': content[1],
        'name': content[2],
        'id': "test"
        }
    try:
        response = requests.post(url, json=data, headers=headers)
        connection_interval = response.json()["connection_interval"]
    except requests.exceptions.RequestException as e:
        print(f'Request failed: {e}')
    ser.close()
    time.sleep(connection_interval)