var http = require('http');
var through = require('through2');

module.exports = function (users) {
    return http.createServer(function (req, res) {
        users.list().pipe(through.obj(function (row, enc, next) {
            this.push(row.key + '\n');
            next();
        })).pipe(res);
    });
};
