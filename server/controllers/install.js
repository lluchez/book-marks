'use strict'

module.exports = {
	
	getRoutesMap: function() {
		return [
			{
				pattern: '/install',
				routes: [
					{"method": "GET", "handler": this.install.bind(this)}
				]
			}
		]
	},
	
	install: function(req, resp) {
		var Q = require('q'), 
			mongoCollections = require('../config/mongodb').collections, 
			mongoHelper = require('../mongo-helper')
		Q.async( function* (){
			var db = yield mongoHelper.connect()
			for(var key in mongoCollections)
				yield mongoHelper.createCollection(db, mongoCollections[key])
			resp.status(200).json( {success: true} )
		}.bind(this))()
		.catch( function(err) { 
			require('../error-manager').handleError(resp, err, "Error during installation")
		})
	}

}