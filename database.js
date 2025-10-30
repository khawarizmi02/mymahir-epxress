const mysql = require('mysql2/promise');

const database = mysql.createPool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT, 10),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

// Test Connection
(async () => {
	const maxRetries = 5
	for (let i = 1; i <= maxRetries; i++) {
		try {
			const connection = await database.getConnection();
			console.log('✅ Connected to MySQL database!');
			connection.release();
			break;
		} catch (err) {
			console.error(`Attempt ${i}: Database connection failed:`, err.message);
			if (i === maxRetries) process.exit(1);
			await new Promise(res => setTimeout(res, 5000));
		}
	}
})();


module.exports = database