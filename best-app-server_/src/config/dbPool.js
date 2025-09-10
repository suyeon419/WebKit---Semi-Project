const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'Semi', //root
    password: '1111', //1234
    database: 'semidb',
    connectionLimit: 10,
    waitForConnections: true,
});
module.exports = pool;
