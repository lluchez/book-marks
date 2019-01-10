'use strict'


Date.prototype.addSeconds = function (num) {
	var value = this.valueOf()
	value += 1000 * num
	return new Date(value)
}

Date.prototype.addMinutes = function (num) {
	var value = this.valueOf()
	value += 60000 * num
	return new Date(value)
}

Date.prototype.addHours = function (num) {
	var value = this.valueOf()
	value += 3600000 * num
	return new Date(value)
}

Date.prototype.addDays = function (num) {
	var value = this.valueOf()
	value += 86400000 * num
	return new Date(value)
}

Date.prototype.addMonths = function (num) {
	var value = new Date(this.valueOf()), mo = this.getMonth(), yr = this.getYear()
	mo = (mo + num) % 12
	if (0 > mo) {
		yr += (this.getMonth() + num - mo - 12) / 12
		mo += 12
	}
	else
		yr += ((this.getMonth() + num - mo) / 12)
	value.setMonth(mo)
	value.setYear(yr)
	return value
}


module.exports = {
	
	nowUTC: function() {
		const now = new Date()
		return new Date(now.getTime() + now.getTimezoneOffset() * 60000)
	},
	
	valueNowUTC: function() {
		return this.nowUTC().valueOf()
	},
	
	parseUTC: function(value) {
		const dt = new Date(value)
		return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
	}
}
