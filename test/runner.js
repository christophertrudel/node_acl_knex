'use strict';

var knex = require('knex');
var KnexBackend = require('../');
var tests = require('../node_modules/acl/test/tests');
var assert = require('chai').assert;
var error = null;
var options;

function run() {
	Object.keys(tests).forEach(function (test) {
		tests[test]();
	});
}

describe('Postgres', function () {
	describe('testing setup method', function () {
		before(function () {
			error = null;
			options = {
				meta: 'meta',
				parents: 'parents',
				permissions: 'permissions',
				resources: 'resources',
				roles: 'roles',
				users: 'users'
			};
		});

		describe('with passing options parameter', function () {
			before(function (done) {
				var self = this;
				var db = knex({
					client: 'postgres',
					connection: 'postgres://postgres@127.0.0.1:5432/travis_ci_test'
				});

				new KnexBackend().setup([null, null, null, null, null, null, null, db, options], function(err, db) {
					error = err;
					if (err) return done(err);
					done();
				});
			});

			it('should create tables in database with given options', function () {
				assert(!error);
			});

			describe('and then using teardown method', function () {
				before(function (done) {
					var self = this;
					var db = knex({
						client: 'postgres',
						connection: 'postgres://postgres@127.0.0.1:5432/travis_ci_test'
					});
					new KnexBackend().teardown([null, null, null, null, null, null, null, db, options], function(err, db) {
						error = err;
						if (err) return done(err);
						done();
					});
				});

				it('should drop tables in database', function () {
					assert(!error);
				});
			});
		});

		describe('with passing db', function () {
			before(function (done) {
				var self = this;
				var db = knex({
					client: 'postgres',
					connection: 'postgres://postgres@127.0.0.1:5432/travis_ci_test'
				});
				new KnexBackend().setup([null, null, null, null, null, null, null, db], function(err, db) {
					error = err;
					if (err) return done(err);
					done();
				});
			});

			it('should create tables in database', function () {
				assert(!error);
			});

			describe('and then using teardown method', function () {
				before(function (done) {
					var self = this;
					var db = knex({
						client: 'postgres',
						connection: 'postgres://postgres@127.0.0.1:5432/travis_ci_test'
					});
					new KnexBackend().teardown([null, null, null, null, null, null, null, db], function(err, db) {
						error = err;
						if (err) return done(err);
						done();
					});
				});

				it('should drop tables in database', function () {
					assert(!error);
				});
			});
		});

		describe('with connection string', function () {
			before(function (done) {
				var self = this;

				new KnexBackend().setup([null, null, null, null, null, null, 'postgres://postgres@127.0.0.1:5432/travis_ci_test'], function(err, db) {
					error = err;
					if (err) return done(err);
					done();
				});
			});

			it('should create tables in database', function () {
				assert(!error);
			});

			describe('and then using teardown method', function () {
				before(function (done) {
					var self = this;

					new KnexBackend().teardown([null, null, null, null, null, null, 'postgres://postgres@127.0.0.1:5432/travis_ci_test'], function(err, db) {
						error = err;
						if (err) return done(err);
						done();
					});
				});

				it('should drop tables in database', function () {
					assert(!error);
				});
			});
		});

		describe('without connection string', function () {
			before(function (done) {
				var self = this;

				new KnexBackend().setup(['travis_ci_test', 'postgres'], function(err, db) {
					error = err;
					if (err) return done(err);
					done();
				});
			});

			it('should create tables in database', function () {
				assert(!error);
			});

			describe('and then using teardown method', function () {
				before(function (done) {
					var self = this;

					new KnexBackend().teardown(['travis_ci_test', 'postgres'], function(err, db) {
						error = err;
						if (err) return done(err);
						done();
					});
				});

				it('should drop tables in database', function () {
					assert(!error);
				});
			});
		});
	});

	describe('Acl Test', function () {
		before(function (done) {
			var self = this;
			var db = knex({
				client: 'postgres',
				connection: 'postgres://postgres@127.0.0.1:5432/travis_ci_test'
			});
			new KnexBackend().setup([null, null, null, null, null, null, null, db], function(err, db) {
				if (err) return done(err);
				self.backend = new KnexBackend(db, 'postgres', 'acl_');
				done();
			});
		});

		run();
	});
});

// Mysql and SQLite support coming soon.

// describe('MySql', function () {
// 	before(function (done) {
// 		var self = this;
// 		var db = knex({
// 			client: 'mysql',
// 			connection: {
// 				host: '127.0.0.1',
// 				port: 3306,
// 				user: 'root',
// 				password: ''
// 				database: 'travis_ci_test'
// 			}
// 		});

// 		var downSql = 'DROP TABLE IF EXISTS acl_meta, acl_resources, acl_parents, acl_users, acl_permissions';

// 		db.raw(downSql)
// 			.then(function() {
// 				self.backend = new KnexBackend(db, 'mysql', 'acl_');
// 				done();
// 			})
// 		;

// 	});

// 	run();
// });

describe('SQLite', function () {
	before(function (done) {
		var self = this;
		var db = knex({
			client: 'sqlite3',
			connection: {
				filename: './test.sqlite'
			}
		});

		new KnexBackend().setup([null, null, null, null, null, null, null, db], function(err, db) {
			if (err) return done(err);
			self.backend = new KnexBackend(db, 'sqlite3', 'acl_');
			done();
		});
	});

	run();
});
