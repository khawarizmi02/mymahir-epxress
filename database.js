const mysql = require( 'mysql2/promise' );

// Create Connection
// const database = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'khawa123',
//   database: 'mymahirdb'
// });

const database = mysql.createPool({
  host: '127.0.0.1',
	port: 3307,
  user: 'myuser',
  password: 'mypassword',
  database: 'users'
});

// Test Connection
( async () => {
  try {
    const connection = await database.getConnection();
    console.log( 'Connected to MySQL database!' );
    connection.release();
  } catch ( err ) {
    console.error( 'Database connection failed:', err.message );
  }
})();


module.exports = database