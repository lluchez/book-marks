'use strict'


module.exports = {
	
	// Status Code for DB errors (mongoDB)
	dbErrStatusCode: 500, // needs to validate: 500 <= xxx < 600
	
	// Create error object that will be catched and passed to the error handler defined below
	// NOTE: error preferably needs to be a Error object
	// Usage: throw errorManager.raiseError(<Message>, <StatusCode>)
	raiseError: function(error, statusCode = 0) {
		return {
			"error": error,
			"status": statusCode || this.dbErrStatusCode
		}
	},
	
	// Error handler to be used for the Try/Catch
	// Usage: .catch( function(err) { errorManager.handleError(resp, err, <Custom Message>) })
	handleError: function(resp, err, msgForInternalErr = null) {
		if( typeof err === 'object' && !err.error )
			err = this.raiseError(err, 500)
		var status = err.status, errMsg = err.error
		if( (typeof errMsg !== 'string') && (typeof errMsg.message !== 'undefined') )
			errMsg = errMsg.message
		console.log("ERROR ", errMsg)
		if( (status >= 500) && (status < 600) && (typeof msgForInternalErr === 'string') )
			errMsg = msgForInternalErr
		resp.status(status).json({
			"error": errMsg, 
			"status": status
		})
	}
	
}
