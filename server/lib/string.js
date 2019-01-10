'use strict'

// Usage: <string>.format([val1 [, val2, ...]])
if (!String.prototype.format) {
  String.prototype.format = function() {
    return this.replace(/{(\d+)}/g, function(args, match, number) { 
      return ((typeof args[number] !== 'undefined') ? args[number] : match)
    }.bind(this, arguments))
  }
}


// Usage: <string>.isEmpty()
if (!String.prototype.isEmpty) {
  String.prototype.isEmpty = function() {
    return !! /^[\s\xa0]*$/.test(this)
  }
}


// Usage: <string>.endsWith(searchString [, position])
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(searchString, position) {
		var subjectString = this.toString()
		if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length)
			position = subjectString.length
		position -= searchString.length
		var lastIndex = subjectString.lastIndexOf(searchString, position)
		return (lastIndex !== -1) && (lastIndex === position)
	}
}