const mysql = require('mysql2/promise');

const database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'FErd1983~!',
    database: 'mymahirnov'
});

(async ()=> {
    try {
        const connection = await database.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
    } catch(err){
        console.error(err);
    }
})();

module.exports = database;