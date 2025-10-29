const express = require('express')
const db = require('../../../database')
const ValidationError = require('../../../utils/ValidationError')
const router = express.Router()

function validataData(title, selected = false) {

	const errorMessage = []

	if (!title || title.trim() === '') {
		errorMessage.push('Title cannot be empty.')
	}

	if (typeof selected !== "boolean") {
		errorMessage.push('selected field must be boolean.')
	}

	return errorMessage.join(" ")
}

router.get('/', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()

		const [query] = await connection.query('SELECT * FROM todos')
		const todos = query
		
		await connection.commit()

		res.status(200).json({
			success: true,
			message: "Todo successfully fetched",
			todos
		})
	} catch (error) {
		await connection.rollback()
		res.status(500).json({
			success: false,
			message: error.message
		})
	} finally {
		connection.release()
	}
})

router.delete('/:id', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()
		const id = req.params.id
		const [query] = await connection.query('DELETE FROM todos WHERE id = ?', [id])

		if (query.affectedRows === 0) throw new Error('Failed to delete todo with id:', id)
		
		await connection.commit()

		res.status(200).json({
			success: true,
			message: `Todo with id:${id} deleted.`
		})
	} catch (error) {
		await connection.rollback()
	} finally {
		connection.release()
	}
})

router.put('/:id', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()

		const data = { ...req.body, ...req.params.id }

		
		await connection.commit()
	} catch (error) {
		await connection.rollback()
	} finally {
		connection.release()
	}
})

router.post('/', async (req, res) => {
	const connection = await db.getConnection()
	try {
		await connection.beginTransaction()

		const { title, selected } = req.body
		const errorMessage = validataData( title, selected)

		if (errorMessage) throw new ValidationError(errorMessage)

		const [query] = await connection.query(
			'INSERT INTO todos (title, selected) VALUES (?, ?)',
			[title, selected]		
		)

		if (!query || query.affectedRows === 0) throw new Error('Error create new todo.')
		await connection.commit()

		res.status(200).json({
			success: true,
			message: "Todo successfully created.",
			data: {
				queryId: query.insertId,
				title,
				selected
			}
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

module.exports = router