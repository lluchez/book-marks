'use strict'

// add the format() function to the String class
if( !String.prototype.format ) {
  String.prototype.format = function() {
		'use strict'
    return this.replace(/{(\d+)}/g, function(args, match, number) { 
      return ((typeof args[number] != 'undefined') ? args[number] : match);
    }.bind(this, arguments));
  };
}

// add the includes() function to the Array class
if( !Array.prototype.includes ) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict'
    var O = Object(this), len = parseInt(O.length) || 0
    if (len === 0)
      return false
    var n = parseInt(arguments[1]) || 0, k, currentElement
    if (n >= 0) {
      k = n
    } else {
      k = len + n;
      if (k < 0)
				k = 0
    }
    while (k < len) {
      currentElement = O[k]
      if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement))
        return true
      k++
    }
    return false
  }
}

// add the includes() function to lodash if using only core
if( (typeof _ !== 'undefined') && !_.prototype.includes ) {
  _.prototype.includes = function(array, value /*, fromIndex*/ ) {
		return array.includes(value)
	}
}



document.goBack = function() {
	history.back()
	// the code at the following address doesn't seem to work well: http://stackoverflow.com/questions/9756159/using-javascript-how-to-create-a-go-back-link-that-takes-the-user-to-a-link-i
}