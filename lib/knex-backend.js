/**
	Knex Backend.
	Implementation of the storage backend using Knex.js
*/
'use strict';

var contract = require('./contract');
var async = require('async');
var _ = require('lodash');
var createTables = require('../lib/databaseTasks').createTables;
var buckets = require('./buckets');

function KnexDBBackend(db, client, prefix, options){
	this.db = db;
	this.buckets = buckets(options);
	this.prefix = typeof prefix !== 'undefined' ? prefix : '';
}

KnexDBBackend.prototype = {
	/**  
		 Begins a transaction.
	*/
	begin : function(){
		// returns a transaction object
		return [];
	},
	
	/**
		 Ends a transaction (and executes it)
	*/
	end : function(transaction, cb){
		contract(arguments)
			.params('array', 'function')
			.end()
		;
		
		// Execute transaction
		async.series(transaction,function(err){
			cb(err instanceof Error? err : undefined);
		});
	},
	
	/**
		Cleans the whole storage.
	*/
	clean : function(cb){
		contract(arguments)
			.params('function')
			.end()
		;
		cb(undefined);
	},
	
	/**
		 Gets the contents at the bucket's key.
	*/
	get : function(bucket, key, cb){
		contract(arguments)
			.params('string', 'string|number', 'function')
			.end()
		;
		
		var table = '';
		if (bucket.indexOf('allows') != -1) {
			table = this.prefix + this.buckets.permissions;
			this.db
				.select('key', 'value')
				.from(table)
				.where({'key': bucket})
				.then(function(result) {
					if (result.length) {
						var value = JSON.parse(result[0].value)
						cb(undefined, (value[key] || []));
					} else {
						cb(undefined, []);
					}
				})
			;
		} else {
			table = this.prefix + bucket;
			this.db
				.select('key', 'value')
				.from(table)
				.where({'key': key})
				.then(function(result) {
					cb(undefined, (result.length ? JSON.parse(result[0].value) : []));
				})
			;
		}
	},
	
	/**
		Returns the union of the values in the given keys.
	*/
	union : function(bucket, keys, cb){
		contract(arguments)
			.params('string', 'array', 'function')
			.end()
		;
		
		var table = '';
		if (bucket.indexOf('allows') != -1) {
			table = this.prefix + this.buckets.permissions;
			this.db
				.select('key', 'value')
				.from(table)
				.where({'key': bucket})
				.then(function(results) {
					if (results.length && results[0].value) {
						var keyArrays = [];
						_.each(keys, function(key) {
							keyArrays.push.apply(keyArrays, JSON.parse(results[0].value)[key]);
						});
						cb(undefined, _.union(keyArrays));
					} else {
						cb(undefined, []);
					}
					
				})
			;
		} else {
			table = this.prefix + bucket;
			this.db
				.select('key', 'value')
				.from(table)
				.whereIn('key', keys)
				.then(function(results) {
					if (results.length) {
						var keyArrays = [];
						_.each(results, function(result) {
							keyArrays.push.apply(keyArrays, JSON.parse(result.value));
						});
						cb(undefined, _.union(keyArrays));
					} else {
						cb(undefined, []);
					}
				})
			;
		}
	},
	
	/**
		Adds values to a given key inside a table.
	*/
	add : function(transaction, bucket, key, values){
		contract(arguments)
			.params('array', 'string', 'string|number','string|array|number')
			.end()
		;
		
		var self = this;
		var table = '';
		values = Array.isArray(values) ? values : [values]; // we always want to have an array for values
		
		transaction.push(function(cb){
			
			if (bucket.indexOf('allows') != -1) {
				table = self.prefix + self.buckets.permissions;
				self.db
					.select('key', 'value')
					.from(table)
					.where({'key': bucket})
					.then(function(result) {
						var json = {};
						
						if (result.length === 0) {
							
							// if no results found do a fresh insert
							json[key] = values;
							return self.db(table)
								.insert({key: bucket, value: JSON.stringify(json)})
							;
						} else {
							var value = JSON.parse(result[0].value)
							
							// if we have found the key in the table then lets refresh the data
							if (_.has(value, key)) {
								value[key] = _.union(values, value[key]);
							} else {
								value[key] = values;
							}
							
							return self.db(table)
								.where('key', bucket)
								.update({key: bucket, value: JSON.stringify(value)})
							;
						}
					})
					.then(function() {
						cb(undefined);
					})
				;
			} else {
				table = self.prefix + bucket;
				self.db
					.select('key', 'value')
					.from(table)
					.where({'key': key})
					.then(function(result) {
						
						if (result.length === 0) {
							
							// if no results found do a fresh insert
							return self.db(table)
								.insert({key: key, value: JSON.stringify(values)})
							;
						} else {
							
							// if we have found the key in the table then lets refresh the data
							return self.db(table)
								.where('key', key)
								.update({value: JSON.stringify(_.union(values, JSON.parse(result[0].value)))})
							;
						}
					})
					.then(function() {
						cb(undefined);
					})
				;
			}
		});
	},
	
	/**
		 Delete the given key(s) at the bucket
	*/
	del : function(transaction, bucket, keys){
		contract(arguments)
			.params('array', 'string', 'string|array')
			.end()
		;
		
		var self = this;
		var table = '';
		keys = Array.isArray(keys) ? keys : [keys]; // we always want to have an array for keys
		
		transaction.push(function(cb){
			
			if (bucket.indexOf('allows') != -1) {
				table = self.prefix + self.buckets.permissions;
				self.db
					.select('key', 'value')
					.from(table)
					.where({'key': bucket})
					.then(function(result) {
						
						if (result.length === 0) {
							
						} else {
							var value = JSON.parse(result[0].value)

							_.each(keys, function(keyValue) {
								value = _.omit(value, keyValue);
							});
							
							if (_.isEmpty(result[0].value)) {
								// if no more roles stored for a resource the remove the resource
								return self.db(table)
									.where('key', bucket)
									.del()
								;
							} else {
								return self.db(table)
									.where('key', bucket)
									.update({value: JSON.stringify(value)})
								;
							}
						}
					})
					.then(function() {
						cb(undefined);
					})
				;
			} else {
				table = self.prefix + bucket;
				self.db(table)
					.whereIn('key', keys)
					.del()
					.then(function() {
						cb(undefined);
					})
				;
			}
		});
	},
	
	/**
		Removes values from a given key inside a bucket.
	*/
	remove : function(transaction, bucket, key, values){
		contract(arguments)
			.params('array', 'string', 'string|number','string|array')
			.end()
		;
		
		var self = this;
		var table = '';
		values = Array.isArray(values) ? values : [values]; // we always want to have an array for values
		
		transaction.push(function(cb){
			
			if (bucket.indexOf('allows') != -1) {
				table = self.prefix + self.buckets.permissions;
				self.db
					.select('key', 'value')
					.from(table)
					.where({'key': bucket})
					.then(function(result) {
						if(result.length === 0) {return;}
						
						var value = JSON.parse(result[0].value)

						// update the permissions for the role by removing what was requested
						_.each(values, function(keyValue) {
							value[key] = _.without(value[key], keyValue);
						});
						
						//  if no more permissions in the role then remove the role
						if (!value[key].length) {
							value = _.omit(value, key);
						}
						
						return self.db(table)
							.where('key', bucket)
							.update({value: JSON.stringify(value)})
						;
					})
					.then(function() {
						cb(undefined);
					})
				;
			} else {
				table = self.prefix + bucket;
				self.db
					.select('key', 'value')
					.from(table)
					.where({'key': key})
					.then(function(result) {
						if(result.length === 0) {return;}
						
						var resultValues = JSON.parse(result[0].value);
						// if we have found the key in the table then lets remove the values from it
						_.each(values, function(value) {
							resultValues = _.without(resultValues, value);
						});
						return self.db(table)
							.where('key', key)
							.update({value: JSON.stringify(resultValues)})
						;
					})
					.then(function() {
						cb(undefined);
					})
				;
			}
		});
	}
};

KnexDBBackend.prototype.setup = createTables;
KnexDBBackend.prototype.teardown = require('../lib/databaseTasks').dropTables;

exports = module.exports = KnexDBBackend;
