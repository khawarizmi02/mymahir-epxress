class ValidationError extends Error {
	code = 400
	constructor(message) {
		super(message)
		this.name = "ValidationError"
	}
}

module.exports = ValidationError
