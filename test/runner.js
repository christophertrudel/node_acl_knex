'use strict';

var knex = require('knex');
var KnexBackend = require('../');
var tests = require('../node_modules/acl/test/tests');

function run() {
	Object.keys(tests).forEach(function (test) {
		tests[test]();
	});
}

describe('Postgres', function () {
	before(function (done) {
		var self = this;
		
		var db = knex({
			client: 'postgres',
			connection: {
				host: '127.0.0.1',
				port: 5432,
				user: 'postgres',
				database: 'travis_ci_test'
			}
		});
		
		var downSql = 'DROP TABLE IF EXISTS "acl_meta";'+
			'DROP TABLE IF EXISTS "acl_resources";'+
			'DROP TABLE IF EXISTS "acl_parents";'+
			'DROP TABLE IF EXISTS "acl_users";'+
			'DROP TABLE IF EXISTS "acl_permissions";'
		;
		var upSql = 'CREATE TABLE acl_meta (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
			'CREATE TABLE acl_resources (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
			'CREATE TABLE acl_parents (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
			'CREATE TABLE acl_users (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
			'CREATE TABLE acl_permissions (key TEXT NOT NULL PRIMARY KEY, value JSON NOT NULL);'
		;
		
		db.raw(downSql+upSql)
			.then(function() {
				self.backend = new KnexBackend(db, 'postgres', 'acl_');
				done();
			})
		;
	});
	
	run();
});

// describe('MySql', function () {
// 	before(function (done) {
// 		var self = this;
// 		var db = knex({
// 			client: 'mysql'
// 		});
		
// 	});
	
// 	run();
// });

// describe('SQLite', function () {
// 	before(function (done) {
// 		var self = this;
// 		var db = knex({
// 			client: 'sqlite'
// 		});
		
// 	});
	
// 	run();
// });