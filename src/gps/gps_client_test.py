import requests
from datetime import datetime

content = []
with open('./config.txt', 'r', encoding='utf-8') as file:
    for line in file:
        content.append(line.strip())
print(content)

"""

url = 'https://9fab-220-68-54-138.ngrok-free.app/test' # ngrok 주소로 바꾸고
#cur_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#data = {
#    'id': '333',
#    'latitude': 34.60,
#    'longitude': 125.19082,
#    'time': cur_time,
#    'battery': 'NULL',
#    'client_version': 'NULL',
#    'type': 'PYPY',
#    'name': 'Python Client'
#}
data = {
    'content': 'test'
}
headers = {'Content-Type': 'application/json; charset=utf-8'}
try:
    response = requests.post(url, json=data, headers=headers)

    print(f'Status Code: {response.status_code}')
    print(f'Response Body: {response.text}')

except requests.exceptions.RequestException as e:
    print(f'Request failed: {e}')

"""