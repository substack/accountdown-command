var subarg = require('subarg');
var fs = require('fs');
var through = require('through2');
var concat = require('concat-stream');
var readonly = require('read-only-stream');
var defined = require('defined');

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
        return showHelp(opts.command, cb);
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
            if (err) return output.emit('error', error(err));
            output.end();
            if (cb) cb();
        });
        return readonly(output);
    }
    else if (cmd === 'list') {
        var output = through.obj(
            function (row, enc, next) {
                this.push(row.key + '\n');
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
    else if (cmd === 'get') {
        var output = through();
        if (cb) output.on('error', cb);
        if (!argv._[1]) {
            var err = new Error('usage: ' + $0 + 'get ID}');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        users.get(argv._[1], function (err, value) {
            if (err) return output.emit('error', error(err));
            output.end(JSON.stringify(value, null, 2) + '\n');
            cb();
        });
        return readonly(output);
    }
    else if (cmd === 'verify') {
        var output = through();
        if (cb) output.on('error', cb);
        if (!argv._[1]) {
            var err = new Error('usage: ' + $0 + 'verify TYPE {PARAMETERS}');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        users.verify(argv._[1], argv, function (err, ok, id) {
            if (err) return output.emit('error', error(err));
            if (!ok) return output.emit('error', error('verify failed'));
            output.end(id + '\n');
            if (cb) cb(null, ok, id);
        });
        return readonly(output);
    }
    else if (cmd === 'put') {
        var output = through();
        if (cb) output.on('error', cb);
        argv = subarg(args, { alias: { v: 'value' } });
        var value = defined(argv.value, argv._[2]);
        if (typeof value === 'string') {
            value = JSON.parse(value);
        }
        
        if (!argv._[1] || value === undefined) {
            var err = new Error('usage: ' + $0 + 'put KEY VALUE');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        users.put(argv._[1], value, function (err) {
            if (err) return output.emit('error', err);
            output.end();
            if (cb) cb(null);
        });
        return readonly(output);
    }
    else if (cmd === 'remove' || cmd === 'rm') {
        var output = through();
        if (cb) output.on('error', cb);
        if (!argv._[1]) {
            var err = new Error('usage: ' + $0 + 'remove KEY');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        users.remove(argv._[1], function (err) {
            if (err) return output.emit('error', err);
            output.end();
            if (cb) cb(null);
        });
        return readonly(output);
    }
    else if (cmd === 'addlogin') {
        var output = through();
        argv = subarg(args, { alias: { i: 'id', t: 'type' } });
        if (cb) output.on('error', cb);
        var id = defined(argv.id, argv._[1]);
        var type = defined(argv.type, argv._[2]);
        
        if (!id || !type) {
            var err = new Error('usage: ' + $0 + 'addlogin ID TYPE {PARAMETERS}');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        
        users.addLogin(id, type, argv, function (err) {
            if (err) return output.emit('error', error(err));
            if (cb) cb(null);
            output.end();
        });
        return readonly(output);
    }
    else if (cmd === 'listlogin') {
        argv = subarg(args, { alias: { i: 'id' } });
        var output = through.obj(
            function (row, enc, next) {
                this.push(row.key + '\n');
                next();
            },
            function () {
                if (cb) cb(null);
                this.push(null);
            }
        );
        if (cb) output.on('error', cb);
        
        var id = defined(argv.id, argv._[1]);
        if (!id) {
            var err = new Error('usage: ' + $0 + 'listlogin ID');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        return readonly(users.listLogin(id).pipe(output));
    }
    else if (cmd === 'rmlogin') {
        var output = through();
        argv = subarg(args, { alias: { i: 'id', t: 'type' } });
        if (cb) output.on('error', cb);
        var id = defined(argv.id, argv._[1]);
        var type = defined(argv.type, argv._[2]);
        
        if (!id || !type) {
            var err = new Error('usage: ' + $0 + 'rmlogin ID TYPE');
            process.nextTick(function () { output.emit('error', err) });
            return readonly(output);
        }
        
        users.removeLogin(id, type, function (err) {
            if (err) return output.emit('error', error(err));
            if (cb) cb(null);
            output.end();
        });
        return readonly(output);
    }
};

function showHelp (cmd, cb) {
    var usage = fs.createReadStream(__dirname + '/usage.txt');
    if (cb) usage.once('end', cb);
    if (!cmd) return usage;
    var output = through();
    usage.pipe(concat(function (buf) {
        var body = buf.toString('utf8');
        output.end(body.replace(/\$0/g, cmd));
    }));
    return output;
}

function error (err) {
    if (!err) return new Error('undefined error');
    if (err.message) return new Error(err.message);
    return Error(err);
}
