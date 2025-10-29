const express = require('express')
const route = express.Router()

route.get('/', (req, res) => {
	res.send("Blog post")
})

route.get(':id', (req, res) => {
	res.send(`Post ${req.params.id}`)
})

module.exports = route