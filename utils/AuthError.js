class AuthError extends Error {
	code = 404
	constructor(message) {
		super(message)
		this.name = "AuthError"
	}
}

module.exports = AuthError