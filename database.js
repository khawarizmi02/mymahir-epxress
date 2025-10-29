const mysql = require( 'mysql2/promise' );

// Create Connection
// const database = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'khawa123',
//   database: 'mymahirdb'
// });

const database = mysql.createPool({
  host: process.env.DB_HOST,
	port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// # Database (match with docker-compose)
// DB_HOST=mysql
// DB_USER=myuser
// DB_PASSWORD=mypassword
// DB_NAME=users
// DB_PORT=3306


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