'use strict'


// to show an overlay panel with a processing spinner
var LoadingPanel = {
	_get: function() { return $('.loading-panel') },
	show: function() { return this._get().show() },
	hide: function() { return this._get().hide() }
}


// properly handles results of Ajax requests showing the loading spinner and toggling the error panel if existing
var AjaxHelper = {
	getPanel: function() {
		return $('#alert-panel')
	},
	defaultErrorCallback: function(message, result) {
		var status = result.status, css = 'alert-danger', title, msg, $panel = this.getPanel()
		if( status >= 400 && status < 500 ) {
			title = 'Something is not quite right'
			msg = result.data.error
			css = 'alert-warning'
		} else if ( status >= 500 && status < 600 ) {
			title = 'Something went wrong'
			msg = 'An internal issue occurred: ' + result.statusText
		} else {
			title = 'Something went wrong'
			msg = 'An issue occurred: ' + result.statusText
		}
		$panel.find('.alert-header').text(title)
		$panel.find('.alert-message').text(msg)
		$panel.find('.alert-status').text('(error {0}, {1})'.format(status, result.statusText))
		$panel.find('.alert').removeClass('alert-.*').addClass(css)
		$panel.show()
	},
	http: function($http, url, data, method, onSuccess, onError) {
		AjaxHelper.getPanel().hide()
		var okCallback = function(okFct, okCallback, errFct, errCallback, result) {
			if( result.data.error ) {
				errFct.call(this, result, result.data.error, errCallback)
			} else {
				okFct.call(this, result, okCallback)
			}
		}.bind(this, this._onSuccess, onSuccess, this._onError, onError),
		errCallback = function(errFct, errCallback, result) {
			errFct.call(this, result, null, errCallback)
		}.bind(this, this._onError, onError)
		LoadingPanel.show()
		$http({
			url: url,
			data: (typeof data === 'string') ? data : $.param(data || {}),
			method: method,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(okCallback, errCallback)
	},
	get: function($http, url, data, onSuccess, onError) {
		this.http($http, url, data, 'GET', onSuccess, onError)
	},
	post: function($http, url, data, onSuccess, onError) {
		this.http($http, url, data, 'POST', onSuccess, onError)
	},
	_onSuccess: function(result, callback) {
		LoadingPanel.hide()
		if( callback )
			callback(result, result.data)
	},
	_onError: function(result, message, callback) {
		LoadingPanel.hide()
		return (callback || this.defaultErrorCallback.bind(this))(message || 'Something went wrong!\nPlease try again.', result)
	}
}


// define the default controller
var nbPagesViewed = 0 // needs to be global
function defaultController($scope) {
	nbPagesViewed++
	$scope.goTo = function(url) {
		document.location.href = url
	}
	$scope.goBack = function(url, event) {
		if( event )
			event.stopPropagation()
		if( nbPagesViewed > 1 ) {
			nbPagesViewed -= 2
			window.history.back()
		} else {
			$scope.goTo(url)
		}
	}
}


// define the module
angular.module("myApp", ['ngRoute'])

// routing
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/home', {
				templateUrl: 'html/views/home.html',
				controller: 'homeController'
			}).
			when('/books', {
				templateUrl: 'html/views/books.html',
				controller: 'booksController'
			}).
			when('/create-book', {
				templateUrl: 'html/views/create-book.html',
				controller: 'createBookController'
			}).
			when('/view-book/:id', {
				templateUrl: 'html/views/view-book.html',
				controller: 'viewBookController'
			}).
			when('/create-book-note/:id', {
				templateUrl: 'html/views/create-book-note.html',
				controller: 'createBookNoteController'
			}).
			when('/todos', {
				templateUrl: 'html/views/todos.html',
				controller: 'todosController'
			}).
			otherwise({
				redirectTo: '/home'
			})
	}
])

// Stored values
.value('bookData', {
	urls: {
		viewAllBooks : '#/books',
		createBook : '#/create-book',
		viewBook: '#/view-book/',
		createBookNote: '#/create-book-note/'
	}
})

// Filters
.filter("bookNotesFilter", function () {
	return function (items, textFiler, sortOption) {
		if( items && sortOption && sortOption.cmp_fct )
			items.sort(sortOption.cmp_fct)
		if( (!(textFiler || '').trim().length) ) return items
		var results = [], words = textFiler.trim().toLowerCase().split(/\s+/)
		angular.forEach(items, function (item) {
			var match = true, name = item.bookName.toLowerCase(), author = item.author.toLowerCase(), tags = item.tags.toLowerCase()
			angular.forEach(words, function(word) {
				match = match && (name.includes(word) || author.includes(word) || tags.includes(word))
			})
			if( match ) results.push(item)
		})
		return results
	}
})


// Controllers
.controller("homeController", ['$scope', '$http', function ($scope, $http) {
	defaultController($scope)
}])
.controller("booksController", ['$scope', '$http', 'bookData', function ($scope, $http, bookData) {
	defaultController($scope)
	$scope.sort = {
		"options": [
			{value: 'date_desc', text: 'By most recent', cmp_fct: function(i1, i2) {
				return (i1.dt_edition === i2.dt_edition) ? 0 : (i1.dt_edition > i2.dt_edition ? -1 : 1)
			}},
			{value: 'title_asc', text: 'By title (alphabetically)', cmp_fct: function(i1, i2) {
				return (i1.bookName === i2.bookName) ? 0 : (i1.bookName > i2.bookName ? 1 : -1)
			}}
		]
	}
	$scope.sort.selected = $scope.sort.options[0]
	AjaxHelper.get($http, '/books', null, function(response, json) {
		$scope.data = json
	})
	$scope.href = function(item) {
		return bookData.urls.viewBook + item._id
	}
	$scope.cssSortOption = function(item) {
		return (item === $scope.sort.selected) ? 'radio-selected' : 'radio-not-selected'
	}
	$scope.sortOptionClicked = function(event, item) {
		$scope.sort.selected = item
	}
	$scope.goToCreateBook = function(event) {
		$scope.goTo(bookData.urls.createBook)
	}
}])
.controller("createBookController", ['$scope', '$http', 'bookData', function ($scope, $http, bookData) {
	defaultController($scope)
	$scope.newItem = {"privacy": 'private'}
	$scope.newItemFormSubmitted = function(event) {
		event.stopPropagation()
		AjaxHelper.post($http, '/book', $scope.newItem, function(response, json) {
			$scope.goTo(bookData.urls.viewAllBooks)
		})
	}
	$scope.goToBooksClicked = function(event) {
		$scope.goBack(bookData.urls.viewAllBooks, event)
	}
}])
.controller("viewBookController", ['$scope', '$http', '$routeParams', 'bookData', function ($scope, $http, $routeParams, bookData) {
	defaultController($scope)
	var bookID = $routeParams.id
	AjaxHelper.get($http, '/book/'+bookID, null, function(response, json) {
		$scope.data = json.item
		$scope.bookExists = true
	})
	$scope.goToCreateBookNoteClicked = function(event) {
		$scope.goTo(bookData.urls.createBookNote + bookID, event)
	}
	$scope.goToBooksClicked = function(event) {
		$scope.goTo(bookData.urls.viewAllBooks, event)
	}
	$scope.removeItemClicked = function(event) {
		if( confirm('Are you sure to delete this book?') ) {
			AjaxHelper.http($http, '/book/'+bookID, null, 'DELETE', function(response, json) {
				$scope.goTo(bookData.urls.viewAllBooks)
			})
		}
	}
}])
.controller("createBookNoteController", ['$scope', '$http', '$routeParams', 'bookData', function ($scope, $http, $routeParams, bookData) {
	defaultController($scope)
	var bookID = $routeParams.id
	AjaxHelper.get($http, '/book/'+bookID, null, function(response, json) {
		$scope.data = json.item
		$scope.bookExists = true
	})
	$scope.cancelNewItemCreationClicked = function() {
		$scope.goBack(bookData.urls.viewBook + bookID, event)
	}
	$scope.newNoteFormSubmitted = function(event) {
		event.stopPropagation()
		AjaxHelper.post($http, '/book/'+bookID+'/notes', $scope.newItem, function(response, json) {
			$scope.goTo(bookData.urls.viewBook + bookID)
		})
	}
}])
.controller("todosController", ['$scope', '$http', function ($scope, $http) {
	defaultController($scope)
}])



// DOM-ready initialization
$(document).ready( function(e) {
  $(".navbar-nav li a").click(function(event) {
		if( (this.href) )
			$(".navbar-collapse").collapse('hide')
  })
})