'use strict'

const Q = require('q'),
	S = require('../lib/string'),
	D = require('../lib/date'),
	//_ = require('underscore'),
	mongoConfig = require('../config/mongodb'),
	collectionName = mongoConfig.collections["book-notes"],
	mongoHelper = require('../mongo-helper'),
	errorManager = require('../error-manager'),
	routing = require('../config/routing')
	
	
function createRootedUrl(relative_url, req) {
	return routing.rootedUrl(relative_url)
}

function createNewItem() {
	return {
		"bookName": '',
		"author": '',
		"tags": '',
		"privacy": 'private',
		"notes": []
	}
}

function publicFields() {
	return ['bookName', 'author', 'tags', 'privacy']
}

function ensurePrivacy(privacy) {
	privacy = privacy.toLowerCase()
	if( ! /^(shared_view_only|public)$/.test(privacy) )
		privacy = 'private'
}

function generateTimestamp() {
	return D.valueNowUTC()
}

function markBookAsEdited(item, now = 0) {
	now = now || generateTimestamp()
	item['dt_edition'] = now
}

function validateItem(item, originItem = null) {
	if( (item.bookName || '').isEmpty() )
		throw errorManager.raiseError("Book name can't be empty", 400)
	var newItem = originItem || createNewItem(), now = generateTimestamp()
	publicFields().forEach( propName => newItem[propName] = item[propName] )
	newItem['privacy'] = ensurePrivacy(newItem['privacy'])
	markBookAsEdited(newItem, now)
	if( !originItem || !newItem['dt_creation'] )
		newItem['dt_creation'] = now
	return newItem
}

function finalizeItemForDisplay(item, req) {
	if( Array.isArray(item) ) {
		item.forEach( i => finalizeItemForDisplay(i, req) )
	} else if( typeof item === 'object' ) {
		//delete item.xxx // to delete private data
		item.link = {"href": createRootedUrl('book-notes/'+item._id, req)}
	}
	return item
}



module.exports = {
	
	getRoutesMap: function() {
		return [
			{
				pattern: '/books',
				routes: [
					{"method": "GET", "handler": this.listBooks.bind(this)} // TO DO: To be removed // for testing only
				]
			},
			{
				pattern: '/book',
				routes: [
					{"method": "POST", "handler": this.createBook.bind(this)}
				]
			},
			{
				pattern: '/book/:id',
				routes: [
					{"method": "GET", "handler": this.loadBook.bind(this)},
					//{"method": "PUT", "handler": this.editBook.bind(this)},
					{"method": "DELETE", "handler": this.removeBook.bind(this)}
				]
			},
			{
				pattern: '/book/:id/notes',
				routes: [
					{"method": "POST", "handler": this.addBookNote.bind(this)}
				]
			}
		]
	},
	
	listBooks: function(req, resp) {
		Q.async( function* (){
			var db = yield mongoHelper.connect(),
				coll = yield mongoHelper.getCollection(db, collectionName),
				items = yield mongoHelper.cursorToArray(coll.find()) // TO DO: to be changed as it can consume a lot of memory
			resp.status(200).json( {"success": true, items: finalizeItemForDisplay(items, req)} )
		}.bind(this))()
		.catch( function(err) {
			errorManager.handleError(resp, err, "Unable to list the book notes")
		})
	},
	
	createBook: function(req, resp) {
		Q.async( function* (){
			var newItem = validateItem(req.body),
				db = yield mongoHelper.connect(),
				coll = yield mongoHelper.getCollection(db, collectionName),
				res = yield mongoHelper.insert(coll, newItem),
				item = finalizeItemForDisplay(res.ops[0], req)
			resp.status(200).json({"created": true, "item": item})
		}.bind(this))()
		.catch( function(err) {
			errorManager.handleError(resp, err, "Unable to create the book")
		})
	},
	
	loadBook: function(req, resp) {
		var id = req.params.id
		Q.async( function* (){
			var db = yield mongoHelper.connect(),
				coll = yield mongoHelper.getCollection(db, collectionName),
				item = yield mongoHelper.findOne(coll, id)
			if( !item )
				throw errorManager.raiseError("Can't find this book", 404)
			resp.status(200).json( {"success": true, item: finalizeItemForDisplay(item, req)} )
		}.bind(this))()
		.catch( function(err) {
			errorManager.handleError(resp, err, "Unable to find the requested book notes")
		})
	},
	
	/*editBook: function(req, resp) {
		console.log("Edit book-notes " + req.params.id)
		resp.status(200).json({"Editing": req.params.id})
	},*/
	
	removeBook: function(req, resp) {
		var id = req.params.id
		console.log("Deleting book " + id)
		Q.async( function* (){
			var db = yield mongoHelper.connect(),
				coll = yield mongoHelper.getCollection(db, collectionName),
				result = yield mongoHelper.remove(coll, id)
			if( result === 0 )
				throw errorManager.raiseError("Can't delete this book", 404) // 401 = Unauthorized
			resp.status(200).json( {"success": true} )
		}.bind(this))()
		.catch( function(err) {
			errorManager.handleError(resp, err, "Unable to delete the requested book notes")
		})
	},
	
	addBookNote: function(req, resp) {
		var id = req.params.id
		console.log("Adding book-notes " + id)
		Q.async( function* (){
			var db = yield mongoHelper.connect(),
				coll = yield mongoHelper.getCollection(db, collectionName),
				now = generateTimestamp()
			var {marker, text} = req.body,
				result = yield mongoHelper.update(coll, {id}, {$set: {dt_edition: now}, $push:{notes:{marker, text, timestamp: now}}})
			if( result.result.nModified === 0 )
				throw errorManager.raiseError("Can't find this book", 404)
			console.log("result", result)
			resp.status(200).json( {"success": true} )
		}.bind(this))()
		.catch( function(err) {
			errorManager.handleError(resp, err, "Unable to add the note to the book")
		})
	},
	
}