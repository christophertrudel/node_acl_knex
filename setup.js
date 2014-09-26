'use strict';

var createTables = require('./lib/databaseTasks').createTables;

createTables(process.argv.slice(2), function() {
	process.exit();
});