
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {createProxyMiddleware} = require('http-proxy-middleware');
const axios = require('axios');

const mysql = require('mysql2/promise');
let pool;
(async () => {
  try {
    // MySQL 서버 연결 설정
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root'
    });

    // 데이터베이스가 없으면 생성
    const dbName = 'gps_service';
    const [dbs] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
    let isDatabaseNew = false;

    if (dbs.length === 0) {
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created.`);
      isDatabaseNew = true;
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    // gps_service 데이터베이스 사용
    await connection.query(`USE ${dbName}`);

    // 데이터베이스가 새로 생성된 경우에만 테이블 생성
    if (isDatabaseNew) {
      const tables = [
        `CREATE TABLE gps (
        id VARCHAR(16) NOT NULL,
        latitude DECIMAL(12,10) NOT NULL,
        longitude DECIMAL(13,10) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        type VARCHAR(100) DEFAULT NULL,
        name VARCHAR(100) DEFAULT NULL,
        PRIMARY KEY (id, timestamp)
        )`,
        `
        CREATE TABLE module (
          id VARCHAR(16) NOT NULL,
          connection_interval INT DEFAULT NULL,
          client_version FLOAT(10,2) DEFAULT NULL,
          recent_connection_time TIMESTAMP DEFAULT NULL,
          PRIMARY KEY (id)
        )`
      ];

      for (const table of tables) {
        await connection.query(table);
        console.log(`Table created.`);
      }

      console.log('All tables are set up.');
    } else {
      console.log('Tables already exist. Skipping table creation.');
    }

    // 연결 종료
    await connection.end();

    // Pool 생성
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: dbName
    });

    console.log('Pool created and ready for use.');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();


app.use(express.json());
app.use(cors());

app.listen(8080, function() {
    console.log('listening on 8080');
})

app.use(express.static(path.join(__dirname, '../client/build')));



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

async function queryExecute(query) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(query);
    return [rows, fields];
  } catch (err) {
    console.log('query execute error : ', err);
  } finally {
    if(connection)
      connection.release();
  }
}


app.get('/query/recent_gps', async (req, res) => {
  const query = `
    SELECT gps.*
    FROM gps
    INNER JOIN module
    ON gps.id = module.id AND gps.timestamp = module.recent_connection_time;
    `
  const [rows, fields] = await queryExecute(query);
  res.json(rows);
});

app.get('/query/gps', async (req, res) => {
  const query = `
    SELECT *
    FROM gps;
  `
  const [rows, fields] = await queryExecute(query);
  res.json({
    row: rows,
    field: fields
  });
});

app.get('/query/module', async (req, res) => {
  
  const query = `
      SELECT *
      FROM module;
    `
  const [rows, fields] = await queryExecute(query);
  res.json({
      row: rows,
      field: fields
  });
});

app.get('/query/total_module', async (req, res) => {
  const query = `
  SELECT gps.type, count(*) FROM gps INNER JOIN module
  ON gps.id = module.id AND gps.timestamp = module.recent_connection_time
  GROUP BY gps.type;
  `
  const [rows, fields] = await queryExecute(query);
  res.json(rows);
});

app.post('/query/update', async (req, res) => {
  const data = req.body;
  const query = `
  UPDATE module
  SET ${data.column} = ${data.value}
  WHERE id = ${data.id};
  `
  const [rows, fields] = await queryExecute(query);
  res.json(rows);
})

const insert_gps = async(data) => {
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT *
      FROM module
      WHERE id = '${data.id}';
    `
    const [rows, fields] = await connection.execute(query);
    let query2;
    if (rows.length > 0) {
      query2 = `
        UPDATE module
        SET client_version = ${data.client_version},
            recent_connection_time = '${data.time}'
        WHERE id = '${data.id}'
      `
    } else {
      query2 = `
        INSERT INTO module (id, connection_interval, client_version, recent_connection_time)
        VALUES ('${data.id}', ${data.client_version}, ${data.client_version}, '${data.time}');
      `
    }
    connection.execute(query2);
    
    const query3 = `
      INSERT INTO gps (id, latitude, longitude, timestamp, type, name)
      VALUES ('${data.id}', ${data.latitude}, ${data.longitude}, '${data.time}', '${data.type}', '${data.name}')
    `
    connection.execute(query3);


  } catch (err) {
    console.log('query execute error : ', err);
  } finally {
    if(connection)
      connection.release();
  }
};

app.post('/test', async (req, res)=> {
  const data = req.body;
  console.log(data);
  insert_gps(data);
  res.status(200).json({
    connection_interval: 2
  });
});

app.post('/print', async (req, res)=> {
  const data = req.body;
  console.log(data);
  res.status(200).json({
    connection_interval: 60
  });
});

app.post('/gps', async (req, res) => {
  const data = req.body;
  let connection;

  if(!data) {
    return res.status(400).json({error: 'No data'});
  }

  insert_gps(data);
  // DB INSERT query
  
  // DB에서 모듈 ID에 해당하는 통신 주기 가져옴

  console.log('Received data:',data.id);
  res.status(200).json({
    connection_interval: 60
  });

});

app.get('/styles/fiord/*', async (req, res) => {
  try {
    const url = `http://localhost:9999${req.url}`;
    console.log('Fetching URL:', url); // 요청 URL 로그
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching tile:', error.message); // 에러 로그
    res.status(500).send('Error fetching tile');
  }
});

app.get('/api/tablelist', (req, res) => {
    const data = ['gps','module'];
    res.json(data);
});