const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const cors = require('cors')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT
const corsOptions = {
	origin: [ 'http://localhost:3000', 'http://localhost:4200' ],
	methods: 'GET,HEAD,PUT,POST,DELETE',
	credentials: true,
	allowedHeaders: ['content-Type', 'Authorization']
}

app.engine('ejs', require('ejs').__express)
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( __dirname, 'views' ));

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride("_method"))
app.use(cors(corsOptions))

app.get("/", (_, res) => {
	res.send('<h1>Hello express</h1>')
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