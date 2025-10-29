const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const ValidationError = require('../../../utils/ValidationError')
const AuthError = require('../../../utils/AuthError')
const db = require('../../../database')
const hash = require('../../../utils/PasswordHash')

function validateUserData(name, email, password) {
	const errorMessage = []

	if (!name || name.trim() === '') {
		errorMessage.push('Name cannot be empty.')
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errorMessage.push('Please enter a valid email address and cannot be empty.')
	}

	if (!password || !/^.{8,}$/.test(password)) {
		errorMessage.push('Password needs to be at least 8 characters.');
	}

	return errorMessage.join(" ")
}

router.post('/sign-up', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()
		const data = { ...req.body, ...req.query }
		const { name, email, password } = data

		const errorMessage = validateUserData(name, email, password)

		if (errorMessage) throw new ValidationError(errorMessage)

		const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email])
		if (existingUser.length !== 0) throw new Error(`User with email: ${email} already existed`)

		const hashedPassword = await hash.hashPassword(password)

		const [query] = await connection.query(
			"INSERT INTO users (name, email, hash_password) VALUES (?, ?, ?)",
			[name, email, hashedPassword]
		)

		if (query.affectedRows === 0) throw new Error("Failed to create new user.")

		await connection.commit()

		res.status(200).json({
			success: true,
			message: "User successfully created.",
			data: {
				queryId: query.insertId,
				name,
				email
			},
		})

	} catch (error) {
		await connection.rollback()
		console.error(error)
		if (error instanceof ValidationError) {
			res.status(400).json({
				success: false,
				message: error.message
			})
		} else {
			res.status(500).json({
				success: false,
				message: error.message
			})
		}
	} finally {
		connection.release()
	}
})

router.post('/sign-in', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()

		const data = { ...req.body, ...req.query }
		const { name, email, password } = data

		const errorMessage = validateUserData(name, email, password)

		if (errorMessage) throw new ValidationError(errorMessage)

		const [query] = await connection.query(
			'SELECT * FROM users WHERE email = ? OR name = ?', 
			[email, name]
		)

		if (!query) throw new Error('Failed to to get user.')

		const user = query[0]

		const isMatched = await hash.verifyPassword(password, user.hash_password)

		if (!isMatched) throw new AuthError('Wrong password.')
		
		await connection.commit()

		const token = jwt.sign(
			{id: user.id, email: user.email, name: user.name},
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		)

		res.status(200).json({
			success: true,
			message: 'Sign-in successfull.',
			token
		})
	} catch (error) {
		await connection.rollback()
		console.error(error)
		if (error instanceof ValidationError || error instanceof AuthError) {
			res.status(error.code).json({
				success: false,
				message: error.message
			})
		} else {
			res.status(500).json({
				success: false,
				message: error.message
			})
		}
	} finally {
		connection.release()
	}
})

module.exports = router