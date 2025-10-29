const express = require('express')

const router = express.Router()

let contacts = [
	{ id: 1, name: "Amsyar", phone: "0123456789" },
	{ id: 2, name: "Amir", phone: "0123456789" },
	{ id: 3, name: "Amrul", phone: "0123456789" },
	{ id: 4, name: "Ammar", phone: "0123456789" },
	{ id: 5, name: "Amirul", phone: "0123456789" },
	{ id: 6, name: "Am", phone: "0123456789" },
	{ id: 7, name: "Amalina", phone: "0123456789" },
	{ id: 8, name: "Amsyah", phone: "0123456789" },
]

router.get('/', (_, res) => {
	res.render('contact/contact', {
		title: "My contact list",
		content: "Manage & View Details of Contacts",
		contacts
	})
})


function renderFormPage(res, error = null, contact = null) {
	const isUpdate = !!contact
	res.render('contact/contact_form', {
		title: isUpdate ? "Update contact" : "Add new contact",
		content: isUpdate ? "Update the details of the contact" : "Fill in the detail to add new contact",
		error,
		contact,
		formAction: isUpdate ? `/contacts/update/${contact.id}?_method=PUT` : "/contacts/add",
	})
}
router.get('/add', (_, res) => renderFormPage(res))
router.post('/add', (req, res) => {
	const { name, phone } = req.body;

	// validation
	if (!name || name.trim() === "") return renderFormPage(res, "Name cannot be empty.")
	if (!phone || !/^\d+$/.test(phone)) return renderFormPage(res, "Phone is invalid.")

	const newContact = {
		id: contacts.length + 1,
		name,
		phone,
	}

	contacts.push(newContact)

	res.redirect('/contacts')
})

router.get('/update/:id', (req, res) => {
	const contact = contacts.find(c => c.id == req.params.id)

	if (!contact) return res.status(404).send("Contact not found");

	renderFormPage(res, null, contact)
})

router.put('/update/:id', (req, res) => {
	const contact = contacts.find(c => c.id == req.params.id)
	const contactIndex = contacts.findIndex(c => c.id == req.params.id)

	if (!contact) return res.status(404).send("Contact not found");

	const { name, phone } = req.body;

	// validation
	if (!name || name.trim() === "") return renderFormPage(res, "Name cannot be empty.")
	if (!phone || !/^\d+$/.test(phone)) return renderFormPage(res, "Phone is invalid.")

	contacts[contactIndex].name = name
	contacts[contactIndex].phone = phone

	contacts = contacts.filter(c => c.id != contact.id)

	contacts.push(contact)
	contacts.sort((a, b) => a.id - b.id)

	// res.status(200).send(`Contact with id:${contact.id} updated.`)
	res.redirect('/contacts')
})

router.get('/:id', (req, res) => {
	const id = req.params.id;

	const contact = contacts.find(contact => contact.id == id)

	if (!contact) return res.status(404).send("Contact not found");

	res.render('contact/contact_details', {
		title: "Contact Details",
		content: "View detailed information about this contact",
		contact,
	})

})

router.delete('/delete/:id', (req, res) => {
	const id = req.params.id;

	const contact = contacts.find(contact => contact.id == id)

	if (!contact) return res.status(404).send("Contact not found");

	contacts = contacts.filter(c => c.id != contact.id)

	// res.status(202).send(`Contact with ${contact.id} successfully deleted.`)
	res.redirect('/contacts')

})



module.exports = router