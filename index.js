const
	port = 3000,
	path = require('path'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser')


// Use the module BodyParser to parse the content of the request than become accessible from rep.body as a JSON object
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
	
//app.use(express.logger('dev'));
require('./server/router')(app)

app.get('/', function(req, res) {
	res.status(200).sendFile(path.join(__dirname, './assets/html/index.html'))
});

app.use(express.static(path.join(__dirname, 'assets')));

app.listen(port, function(){
	console.log(`Ready captain, listening on port ${port}`);
});
