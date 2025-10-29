const express = require('express')

const db = require('../../database')

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const [result] = await db.query("SELECT * FROM users")
		const students = result;

		res.render('student/student_view', {
			title: "Students",
			content: "View student list",
			students
		})
	} catch (error) {
		console.error(error)
	}
})

function validateData(res, name, email, phone, student_no) {

	const student = {
		name,
		email,
		phone,
		student_no
	}

	let errorMessage = ""

	if (!name || name.trim() === '') {
		// return renderFormPage(res, 'Name cannot be empty.', student);
		errorMessage = 'Name cannot be empty.'
	}

	if (!student_no || !/^\d+$/.test(student_no)) {
		// return renderFormPage(res, 'Student number must contain numbers only and cannot be empty.', student);
		errorMessage = 'Student number must contain numbers only and cannot be empty.'
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		// return renderFormPage(res, 'Please enter a valid email address and cannot be empty.', student);
		errorMessage = 'Please enter a valid email address and cannot be empty.'
	}

	if (!/^\d+$/.test(phone)) {
		// return renderFormPage(res, 'Phone number should be number only', student)
		errorMessage = 'Phone number should be number only'
	}

	if (errorMessage) return renderFormPage(res, errorMessage, student)
}


function renderFormPage(res, error = null, student = null) {
	const isUpdate = !!student
	res.render('student/student_form', {
		title: isUpdate ? "Update student" : "Add new student",
		content: isUpdate ? "Update the details of the student" : "Fill in the detail to add new student",
		error,
		student,
		formAction: isUpdate ? `/students/update/${student.id}?_method=PUT` : "/students/add",
	})
}

router.get('/add', (_, res) => renderFormPage(res))
router.post('/add', async (req, res) => {
	try {
		const { name, student_no: studentNo, email, phone } = req.body

		const student = {
			name,
			student_no: studentNo,
			email,
			phone
		}

		validateData(res, name, email, phone, studentNo);
		// // Validation
		// if (!name || name.trim() === '') {
		// 	return renderFormPage(res, 'Name cannot be empty.');
		// }

		// if (!studentNo || !/^\d+$/.test(studentNo)) {
		// 	return renderFormPage(res, 'Student number must contain numbers only and cannot be empty.');
		// }

		// if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		// 	return renderFormPage(res, 'Please enter a valid email address and cannot be empty.');
		// }

		// if (!/^\d+$/.test(phone)) {
		// 	return renderFormPage(res, 'Phone number should be number only')
		// }

		await db.query(
			"INSERT INTO users (name, student_no, email, phone, type) VALUES (?, ?, ?, ?, ?)",
			[name, studentNo, email, phone, "student"]
		)

		res.redirect('/students')
	} catch (error) {
		console.error(error)
		renderFormPage(res, 'Database error. Failed to create new data.')
	}
})

router.get('/update/:id', async (req, res) => {
	try {
		const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
		const student = result[0]

		if (!student) return res.status(404).send(`User with id:${req.params.id} is not found.`)

		renderFormPage(res, null, student)
	} catch (error) {
		console.error(error)
		res.redirect("/students")
	}
})
router.put('/update/:id', async (req, res) => {
	try {
		const { name, student_no: studentNo, email, phone } = req.body

		validateData(res, name, email, phone, studentNo);
		// // Validation
		// if (!name || name.trim() === '') {
		// 	return renderFormPage(res, 'Name cannot be empty.');
		// }

		// if (!studentNo || !/^\d+$/.test(studentNo)) {
		// 	return renderFormPage(res, 'Student number must contain numbers only and cannot be empty.');
		// }

		// if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		// 	return renderFormPage(res, 'Please enter a valid email address and cannot be empty.');
		// }

		// if (!/^\d+$/.test(phone)) {
		// 	return renderFormPage(res, 'Phone number should be number only')
		// }

		// Update Student In Database
		const [result] = await db.query(
			'UPDATE users SET name = ?, student_no = ?,email = ?, phone = ? WHERE id = ?',
			[name, studentNo, email, phone, req.params.id]
		);

		if (!result.affectedRows === 0) {
			return res.status(400).send("Student not found")
		}

		res.redirect('/students')
	} catch (error) {
		console.error(error)
		renderFormPage(res, 'Database error. Failed to update data.')
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id])

		if (!result.affectedRows === 0) {
			return res.status(400).send("Student not found")
		}

		res.redirect('/students')
	} catch (error) {
		console.error(error)
	}
})

router.get('/:id', async (req, res) => {
	try {

		const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
		const student = result[0]

		if (!student) return res.status(404).send(`User with id:${req.params.id} is not found.`)

		res.render('student/student_details', {
			title: "Student Details",
			content: "View detailed information of the student.",
			student,
		})
	} catch (error) {

		console.error(error)
		res.redirect("/students")
	}
})

module.exports = router