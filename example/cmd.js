#!/usr/bin/env node

var accountdown = require('accountdown');
var command = require('../');
var db = require('level-party')('/tmp/accounts.db');

var users = accountdown(db, {
    login: { basic: require('accountdown-basic') }
});

var args = process.argv.slice(2);
if (args[0] === 'users') {
    command(users, process.argv.slice(3), function (err) {
        if (err) {
            console.error(err + '');
            process.exit(1);
        }
        db.close();
    }).pipe(process.stdout);
}
else if (args[0] === 'server') {
    var server = require('./lib/server.js')(users);
    server.listen(5000);
    console.log('http://localhost:5000');
}
