'use strict'

const Q = require('q'),
	ObjectId = require('mongodb').ObjectID,
	STATUS_CODE = 500

function errJson(err, status = 0) {
	return {error: err, status: status || STATUS_CODE}
}

function convertFilter(filter) {
	if( typeof filter === 'string' )
		filter = {id: filter}
	if( filter.id ) {
		try {
			filter._id = ObjectId(filter.id)
		} catch(e) {
			throw errJson("Invalid ID provided", 404)
		}
		delete filter.id
	}
	return filter
}

module.exports = {

	statusCode: STATUS_CODE,
	
	connect: function(log = false) {
		var deferred = Q.defer(), url = require('./config/mongodb').getUrl()
		if( log )
			console.log(`Connecting to ${url}...`)
		require('mongodb').MongoClient.connect(url, (err, db) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(db)
				if( log )
					console.log(` > Connected to ${db.s.databaseName}`)
			}
		})
		return deferred.promise
	},

	createCollection: function(db, name, strict = false) {
		var deferred = Q.defer()
		console.log(`Creating collection ${name}...`)
		db.createCollection(name, {strict: strict}, (err, collection) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(collection)
				console.log(` > Collection ${collection.s.name} has been created or already existed`)
			}
		})
		return deferred.promise
	},

	getCollection: function(db, name, strict = true) {
		var deferred = Q.defer()
		db.collection(name, {strict: strict}, (err, collection) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(collection)
			}
		})
		return deferred.promise
	},
	
	cursorToArray: function(cursor) {
		var deferred = Q.defer()
		cursor.toArray( (err, items) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(items)
			}
		})
		return deferred.promise
	},
	
	findOne: function(collection, filter) {
		filter = convertFilter(filter)
		var deferred = Q.defer()
		collection.findOne(filter, (err, items) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(items)
			}
		})
		return deferred.promise
	},
	
	insert: function(collection, data) {
		var deferred = Q.defer()
		collection.insert(data, {w: 1}, (err, result) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(result)
			}
		})
		return deferred.promise
	},
	
	update: function(collection, filter, data) {
		filter = convertFilter(filter)
		var deferred = Q.defer()
		collection.update(filter, data, {w: 1}, (err, result) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(result)
			}
		})
		return deferred.promise
	},
	
	remove: function(collection, filter) {
		filter = convertFilter(filter)
		var deferred = Q.defer()
		collection.remove(filter, {w: 1}, (err, result) => {
			if( err ) {
				deferred.reject(errJson(err))
			} else {
				deferred.resolve(result)
			}
		})
		return deferred.promise
	},
	
}
