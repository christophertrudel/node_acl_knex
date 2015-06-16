'use strict';

var knex = require('knex');

var downSql = 'DROP TABLE IF EXISTS "{{prefix}}meta";'+
	'DROP TABLE IF EXISTS "{{prefix}}resources";'+
	'DROP TABLE IF EXISTS "{{prefix}}parents";'+
	'DROP TABLE IF EXISTS "{{prefix}}users";'+
	'DROP TABLE IF EXISTS "{{prefix}}roles";'+
	'DROP TABLE IF EXISTS "{{prefix}}permissions";';
var upSql = 'CREATE TABLE {{prefix}}meta (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
	'INSERT INTO {{prefix}}meta VALUES (\'users\', \'{}\');'+
	'INSERT INTO {{prefix}}meta VALUES (\'roles\', \'{}\');'+
	'CREATE TABLE {{prefix}}resources (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
	'CREATE TABLE {{prefix}}parents (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
	'CREATE TABLE {{prefix}}users (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
	'CREATE TABLE {{prefix}}roles (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
	'CREATE TABLE {{prefix}}permissions (key TEXT NOT NULL PRIMARY KEY, value JSON NOT NULL);';

function tmpl(str, ctx) {
	var n = 1;
	var sql = str.replace(/{{(\w+)}}/g, function(match, cap1) {
		return ctx[cap1] || match;
	});
	return sql.replace(/\?/g, function() { return '$' + n++; });
}

function getDB(args, callback) {
	var connection = null;
	var db_name = args[0], username = args[1], password = args[2], db_host = args[4], db_port = args[5], db_url = args[6], db = args[7];
	if (!db && !db_url) {
		if (!db_name) throw Error('no db_name (1st arg) supplied');
		if (!username) throw Error('no username (2nd arg) supplied');
		
		if (!db_host) db_host = '127.0.0.1';
		if (!db_port) db_port = 5432;
		connection = {
			host: db_host,
			port: db_port,
			user: username,
			database: db_name,
			password: password
		}
	} else if (db_url) {
		connection = db_url;
	}
	
	return db = knex({
		client: 'postgres',
		connection: connection
	});
}

function dropTables(args, callback) {
	var prefix = args[3], db = args[7];
	
	if (!db) {
		db = getDB(args);
	}
	if (!prefix) prefix = 'acl_';
	
	db.raw(tmpl(downSql, {'prefix': prefix}))
		.then(function() {
			callback(null, db);
		})
	;
}

function createTables(args, callback) {
	var prefix = args[3], db = args[7];
	
	if (!db) {
		db = getDB(args);
	}
	if (!prefix) prefix = 'acl_';
	
	db.raw(tmpl(downSql+upSql, {'prefix': prefix}))
		.then(function() {
			callback(null, db);
		})
	;
}

exports.createTables = createTables;
exports.dropTables = dropTables;