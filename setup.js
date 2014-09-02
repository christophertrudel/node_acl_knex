'use strict';

var createTables = require('./lib/createTables').createTables;

createTables(process.argv.slice(2), function() {
	process.exit();
});