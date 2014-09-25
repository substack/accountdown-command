var http = require('http');
var through = require('through2');

module.exports = function (users) {
    return http.createServer(function (req, res) {
        users.list().pipe(through.obj(function (row, enc, next) {
console.log(row); 
            this.push(row.key);
            next();
        })).pipe(res);
    });
};
