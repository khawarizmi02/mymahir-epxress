const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
require('dotenv').config()

const db = require('./database')

const app = express()

const PORT = 3000

app.engine('ejs', require('ejs').__express)
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( __dirname, 'views' ));

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride("_method"))

app.get("/", (_, res) => {
	res.send('<h1>Hello express</h1>')
})

app.get("/about", (_, res) => {
	res.send('<h1>About us page</h1>')
})


app.get('/search', (req, res) => {
	const { name, page}  = req.query;
	res.send(`Search keyword: ${name}, Page number: ${page || 1}`)
})

const blogRoutes = require('./router/blogRoutes')
app.use("/posts", blogRoutes)

const posting = [
	{
		id: 1,
		title: "Hello express"
	},
	{
		id: 2,
		title: "Tips Express JS"
	},
]

app.get('/posting', (req, res) => {
	res.render('index', {title: "My Posting", posting})
})

app.get('/posting/:id', (req, res) => {
	const post = posting.find(p=>p.id == Number(req.params.id))
	if(!post) return res.status(404).send('Post not found');
	
	res.render('post', {post})
})

const contactRoutes = require('./router/contactRoutes')
app.use("/contacts", contactRoutes)

const studentRoutes = require('./router/student/student_route')
app.use('/students', studentRoutes)


// API routing
const StudentRoutes = require('./router/api/v1/studentRoutes')
const AuthRoutes = require('./router/api/v1/authRoutes')
const TodoRoutes = require('./router/api/v1/TodoRoutes')

app.use("/api/v1/students", StudentRoutes)
app.use("/api/v1/auth", AuthRoutes)
app.use("/api/v1/todos", TodoRoutes)


app.listen(PORT, () => console.log(`server run in http://localhost:${PORT}`))