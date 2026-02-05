data = 'AT$GPSACP\r\n\r\n$GPSACP: 070439.000,3514.4925N,12841.8123E,7.2,-167.3,3,0.0,0.6,0.3,131124,01,04\r\n\r\nOK\r\n'

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

print(parse_gps_data(data))