'use strict';

var _ = require('lodash');
var buckets = require('./buckets');
var knex = require('knex');

var downSql = 'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{meta}}";'+
  'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{resources}}";'+
  'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{parents}}";'+
  'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{users}}";'+
  'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{roles}}";'+
  'DROP TABLE IF EXISTS "{{schema}}"."{{prefix}}{{permissions}}";';
var upSql = 'CREATE TABLE "{{schema}}"."{{prefix}}{{meta}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
  'INSERT INTO "{{schema}}"."{{prefix}}{{meta}}" VALUES (\'users\', \'{}\');'+
  'INSERT INTO "{{schema}}"."{{prefix}}{{meta}}" VALUES (\'roles\', \'{}\');'+
  'CREATE TABLE "{{schema}}"."{{prefix}}{{resources}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
  'CREATE TABLE "{{schema}}"."{{prefix}}{{parents}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
  'CREATE TABLE "{{schema}}"."{{prefix}}{{roles}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
  'CREATE TABLE "{{schema}}"."{{prefix}}{{users}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);'+
  'CREATE TABLE "{{schema}}"."{{prefix}}{{permissions}}" (key TEXT NOT NULL PRIMARY KEY, value JSON NOT NULL);';

function tmpl(str, ctx) {
  var n = 1;
  var sql = str.replace(/{{(\w+)}}/g, function(match, cap1) {
    return ctx[cap1] || match;
  });
  return sql.replace(/\?/g, function() { return '$' + n++; });
}

function getDB(args, callback) {
  var connection = null;
  var db_name = args[0],
      username = args[1],
      password = args[2],
      db_host = args[4],
      db_port = args[5],
      db_url = args[6],
      db = args[7];
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

function getParamsFromArgs(args) {
  var prefix = args[3],
      db = args[7],
      bucketNames = buckets(args[8]),
      schema = args[9];

  if (!db) {
    db = getDB(args);
  }
  if (!prefix) {
    prefix = 'acl_';
  }
  if (!schema) {
    schema = 'public';
  }
  return {
    prefix: prefix,
    db: db,
    schema: schema,
    bucketNames: bucketNames
  };
}

function dropTables(args, callback) {
  var params = getParamsFromArgs(args);
  var schema = params.schema,
      db = params.db,
      bucketNames = params.bucketNames,
      prefix = params.prefix;

  db.raw(tmpl(downSql, {
            'schema': schema,
            'meta': bucketNames.meta,
            'parents': bucketNames.parents,
            'permissions': bucketNames.permissions,
            'prefix': prefix,
            'resources': bucketNames.resources,
            'roles': bucketNames.roles,
            'users': bucketNames.users
        }))
        .then(function() {
            if (!_.isUndefined(callback)) {
                callback(null, db);
            }
        })
    ;
}

function createTables(args, callback) {
  var params = getParamsFromArgs(args);
  var schema = params.schema,
      db = params.db,
      bucketNames = params.bucketNames,
      prefix = params.prefix;

  db.raw(tmpl(downSql+upSql, {
            'schema': schema,
            'meta': bucketNames.meta,
            'parents': bucketNames.parents,
            'permissions': bucketNames.permissions,
            'prefix': prefix,
            'resources': bucketNames.resources,
            'roles': bucketNames.roles,
            'users': bucketNames.users
        }))
        .then(function() {
            if (!_.isUndefined(callback)) {
                callback(null, db);
            }
        })
    ;
}

exports.createTables = createTables;
exports.dropTables = dropTables;
