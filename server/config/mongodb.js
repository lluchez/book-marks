'use strict'

module.exports = {
	
	host: 'localhost',
	port: 27017,
	base: 'texts',
	
	collections: {
		"book-notes": 'book-notes',
		"todo-lists": 'todo-lists'
	},
	
	getUrl: function() {
		return `mongodb://${this.host}:${this.port}/${this.base}`
	}
}
