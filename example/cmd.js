#!/usr/bin/env node

var accountdown = require('accountdown');
var command = require('../');
var db = require('level-party')('/tmp/accounts.db');

var users = accountdown(db, {
    login: { basic: require('accountdown-basic') }
});

if (process.argv[2] === 'users') {
    command(users, process.argv.slice(3), function (err) {
        if (err) {
            console.error(err + '');
            process.exit(1);
        }
        db.close();
    }).pipe(process.stdout);
}
else {
    var server = require('./server.js')(users);
    server.listen(5000);
    console.log('http://localhost:5000');
}
