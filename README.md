Node Acl KnexBackend
=============

A Knex.js backend for node_acl

Knex is a query builder for PostgreSQL, MySQL and SQLite3 in Node, The Knex backend is to be used as an adapter for [OptimalBits/node_acl](https://github.com/OptimalBits/node_acl).


[![BuildStatus](https://travis-ci.org/christophertrudel/node_acl_knex.svg?branch=master)](https://travis-ci.org/christophertrudel/node_acl_knex)[![Coverage Status](https://img.shields.io/coveralls/christophertrudel/node_acl_knex.svg)](https://coveralls.io/r/christophertrudel/node_acl_knex)[![Dependency Status](https://david-dm.org/christophertrudel/node_acl_knex.svg)](https://david-dm.org/christophertrudel/node_acl_knex)[![devDependency Status](https://david-dm.org/christophertrudel/node_acl_knex/dev-status.svg)](https://david-dm.org/christophertrudel/node_acl_knex#info=devDependencies)

#Quick Start
```
	Acl = require('acl');
	AclKnexBackend = require('acl_knex');
	knex = require('knex');

	var db = knex({
		client: 'postgres',
		connection: {
			host: '127.0.0.1',
			port: 5432,
			user: 'postgres',
			database: 'travis_ci_test'
		}
	});
	
	var acl = new Acl(new AclKnexBackend(db, 'acl_'));
```

#Testing
npm test

Follow me on Twitter [thetrudel](http://twitter.com/thetrudel)