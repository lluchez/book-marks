'use strict'

const env = require('./env'), 
	S = require('../lib/string')


const prodSettings = {
	host: 'lluchez.com:90',
	protocol: 'http',
	alias: ''
}

const devSettings = {
	host: '192.168.0.10:90',
	protocol: 'http',
	alias: ''
}

var {host, protocol, alias} = env.isProd() ? prodSettings : devSettings
if( !alias.isEmpty() && !alias.endsWith('/') )
	alias = alias + '/'


module.exports = {
	
	rootedUrl: function(relative_url) {
		return '{0}://{1}/{2}{3}'.format(protocol, host, alias, relative_url)
	}
	
	/*function extractProtocolFromUrl(url) {
		const idx = url.indexOf(':')
		return ( idx === 1 ) ? '' : url.substring(0, idx)
	}
	
	console.log('process.env.NODE_ENV', process.env.NODE_ENV)
	
	// Sanitize Alias
	if( !alias.isEmpty() && !alias.endsWith('/') )
		alias = alias + '/'
	
	// Using the request param to compute the host and protocol parts
	if( req !== null && typeof req === 'object' ) {
		if( req.hostname && typeof req.socket === 'object' ) {
			var port = req.socket.localPort // WARN I can't find the right way to get the public port
			host = req.hostname + (port == 80 ? '' : ':'+port)
		}
		if( req.protocol )
			protocol = req.protocol
	}
	
	// Using the options param to compute the host and protocol parts
	if( options !== null && typeof options === 'object' ) {
		if( options.host )
			host = options.host
		if( options.protocol )
			protocol = options.protocol
	} else if( typeof options === 'string' ) {
		host = options
	}*/
}