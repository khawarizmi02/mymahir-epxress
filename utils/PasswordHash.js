const bcrypt = require('bcrypt')

const hashPassword = async (password) => {

	const salt = 10
	const hashedPassword = await bcrypt.hash(password, salt)

	return hashedPassword
}

const verifyPassword = async (password, hashedPassword) => {
	const isMatched = await bcrypt.compare(password, hashedPassword)
	return isMatched
}

const hashAlgo = {
	hashPassword,
	verifyPassword
}

module.exports = hashAlgo