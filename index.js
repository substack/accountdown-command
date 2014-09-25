var subarg = require('subarg');
var fs = require('fs');
var through = require('through2');
var concat = require('concat-stream');
var readonly = require('read-only-stream');

module.exports = function (users, args, opts, cb) {
    var argv = subarg(args, {
        alias: { h: 'help' }
    });
    if (!opts) opts = {};
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    var cmd = argv._[0];
    var $0 = opts.command ? opts.command + ' ' : '';
    if (cmd === 'help' || argv.help) {
        return showHelp(opts.command);
    }
    else if (cmd === 'create') {
        argv = subarg(args, {
            alias: { v: 'value', l: 'login' }
        });
        var uopts = {
            login: argv.login,
            value: argv.value
        };
        var output = through();
        if (cb) output.on('error', cb);
        if (!argv._[1]) {
            var err = new Error('usage: ' + $0 + 'create ID {OPTIONS}');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        users.create(argv._[1], uopts, function (err) {
            if (err) return output.emit('error', err);
            output.end();
            if (cb) cb();
        });
        return readonly(output);
    }
    else if (cmd === 'list') {
        var output = through.obj(
            function (row, enc, next) {
                this.push(JSON.stringify(row) + '\n');
                next();
            },
            function () {
                if (cb) cb(null);
                this.push(null);
            }
        );
        if (cb) output.on('error', cb);
        return readonly(users.list().pipe(output));
    }
};

function showHelp (cmd) {
    var usage = fs.createReadStream(__dirname + '/usage.txt');
    if (!cmd) return usage;
    var output = through();
    usage.pipe(concat(function (buf) {
        var body = buf.toString('utf8');
        output.end(body.replace(/\$0/, opts.command));
    }));
    return output;
}
