const express = require('express')
const router = express.Router();

const ValidationError = require('../../../utils/ValidationError')
const verifyToken = require('../../../utils/VerifyToken')
const db = require('../../../database')

const usersFields = [ 'id', 'name', 'email', 'phone', 'student_no', 'type', 'hash_password']

function validateUserData(name, email, phone, student_no) {

	let errorMessage = []

	if (!name || name.trim() === '') {
		errorMessage.push('Name cannot be empty.')
	}

	if (!student_no || !/^\d+$/.test(student_no)) {
		errorMessage.push('Student number must contain numbers only and cannot be empty.')
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errorMessage.push('Please enter a valid email address and cannot be empty.')
	}

	if (!/^\d+$/.test(phone)) {
		errorMessage.push('Phone number should be number only')
	}

	return errorMessage.join(" ")
}

router.get('/', verifyToken, async (_, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction()

		const selectedFields = usersFields.filter((f) => f !== 'hash_password').join(', ')

		const [query] = await db.query(`SELECT ${selectedFields} FROM users WHERE type = ?`, ['student'])
		const students = query

		if (!students) throw new Error("Failed to query users")

		await connection.commit()

		console.log('querying students successfull.', students.length)

		res.status(200).json({
			success: true,
			message: "Users successfully requested",
			students
		})
	} catch (error) {
		console.error(error)
		await connection.rollback()
		res.status(500).json({
			success: false,
			message: error.message
		})
	}
})

router.post('/', verifyToken, async (req, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction()
		const { name, phone, student_no, email } = req.body
		const errorMessage = validateUserData(name, email, phone, student_no)

		if (errorMessage) throw new ValidationError(errorMessage)

		const [query] = await db.query(
			"INSERT INTO users (name, student_no, email, phone, type) VALUES (?, ?, ?, ?, ?)",
			[name, student_no, email, phone, "student"]
		)

		if (!query || query.affectedRows === 0) throw new Error('Error created new data into database.')

		await connection.commit()

		console.log("student created.", query)

		res.status(200).json({
			success: true,
			message: "Student successfully created.",
			data: {
				queryId: query.insertId,
				name,
				phone,
				student_no,
				email
			},
		})
	} catch (error) {
		await connection.rollback()

		if (error instanceof ValidationError) {
			console.error(error)
			res.status(404).json({
				success: false,
				message: error.message
			})
		} else {
			console.error(error)
			res.status(500).json({
				success: false,
				message: error.message
			})
		}
	}
})

router.put('/:id', verifyToken, async (req, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction()
		const id = req.params.id
		const { name, phone, student_no, email } = req.body
		const errorMessage = validateUserData(name, email, phone, student_no)

		if (errorMessage) throw new ValidationError(errorMessage)

		const [query] = await connection.query(
			// "INSERT INTO users (name, student_no, email, phone, type) VALUES (?, ?, ?, ?, ?)",
			"UPDATE users SET name = ?, student_no = ?, email = ?, phone = ? WHERE id = ?",
			[name, student_no, email, phone, id]
		)

		if (!query || query.affectedRows === 0) throw new Error('Error created new data into database.')

		 await connection.commit()

		 console.log("Student updated.")

		res.status(200).json({
			success: true,
			message: "Student successfully created.",
			data: {
				id,
				name,
				phone,
				student_no,
				email
			},
		})
		
	} catch (error) {
		await connection.rollback()

		if (error instanceof ValidationError) {
			console.error(error)
			res.status(404).json({
				success: false,
				message: error.message
			})
		} else {
			console.error(error)
			res.status(500).json({
				success: false,
				message: error.message
			})
		}
	} finally {
		connection.release()
	}
})

router.get('/:id', verifyToken, async (req, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction()
		const id = req.params.id;
		const [query] = await connection.query('SELECT * FROM users WHERE id = ?', [id])

		if (!query || query.length === 0) throw new Error('Error querying a users')
		
		await connection.commit()

		const student = query[0]

		console.log("Querying a student successfull.")

		res.status(200).json({
			success: true,
			message: "Student successfully retrieved.",
			student
		})

	} catch (error) {
		console.error(error)

		await connection.rollback()

		res.status(500).json({
			success: false,
			message: error.message
		})
	} finally {
		connection.release()
	}
})

router.delete('/:id', verifyToken, async (req, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction()
		const id = req.params.id

		const [query] = await connection.query('DELETE FROM users WHERE id = ?', [id])

		if (query.affectedRows === 0 || !query) throw new Error(`Failed to delete student with id:${id}`)

		await connection.commit()

		console.log("Student deleted successfully.")

		res.status(200).json({
			success: true,
			message: `Successfully deleted the with id:${id}`
		})
	} catch (error) {
		console.error(error)

		await connection.rollback()

		res.status(500).json({
			success: false,
			message: error.message
		})
	} finally {
		connection.release()
	}
})

module.exports = router