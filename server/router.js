'use strict'

module.exports = function(app) {
	
	// app.get('/api/:name', function(req, res) {
		// res.status(200).json({ "hello": req.params.name })
	// });

	const controllers = [
		require('./controllers/book-notes')
	]
	controllers.push(require('./controllers/install'))
	
	controllers.forEach( controller => {
		controller.getRoutesMap().forEach( map => {
			var methods = []
			map.routes.forEach( route => {
				var appMethod = route.appMethod || route.method.toLowerCase()
				app[appMethod](map.pattern, route.handler)
				methods.push(route.method)
			})
			app.options(map.pattern, (req, res) => {
				res.status(200).send(methods.join(' '))
			})
		})
	})
	
	return controllers
}