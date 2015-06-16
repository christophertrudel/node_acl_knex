/**
  Buckets names default configuration.
*/
'use strict';

var _ = require('lodash');

var buckets = function(options){
    return _.extend({
        meta: 'meta',
        parents: 'parents',
        permissions: 'permissions',
        resources: 'resources',
        roles: 'roles',
        users: 'users'
    }, options);
};

exports = module.exports = buckets;
