'use strict'


module.exports = {
	
	isProd: function() {
		return /^prod(uction)?/i.test(process.env.NODE_ENV)
	}
	
}
