# accountdown-command

manage accountdown accounts from the command-line

This is particularly useful in combination with
[level-party](https://npmjs.org/package/level-party)
so you can manage users while a server is running.

# example

``` js
var accountdown = require('accountdown');
var command = require('accountdown-command');
var db = require('level-party')('./accounts.db');

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
    require('./lib/server.js')(users).listen(5000);
}
```

Now we can run a web server in the background:

```
$ ./cmd.js server &
[1] 12017
```

and add a user from the command-line:

```
$ ./cmd.js users create 1337 \
  --login.basic.username=substack --login.basic.password=yo \
  --value.name=substack
```

Now we can list users by id:

```
$ ./cmd.js users list
1337
```

and fetch the record for an id:

```
$ ./cmd.js users get 1337
{
  "name": "substack"
}
```

We can change records:

```
$ ./cmd.js users put 1337 --value.name=roboto
$ ./cmd.js users get 1337
{
  "name": "roboto"
}
```

And even check passwords from the command-line:

```
$ ./cmd.js users verify basic --username=substack --password=yo
1337
$ echo $?
0
$ ./cmd.js users verify basic --username=substack --password=yyyy
Error: verify failed
$ echo $?
1
```

# methods

``` js
var command = require('accountdown-command')
```

## var s = command(users, args=[], opts={}, cb)

Execute the shifted command-line arguments `args` to the accountdown instance
`users`.

Return a readable stream `s` of printable content.

Optionally:

* `opts.command` - command prefix to show in place of `$0`

# usage

```
$0 create ID {OPTIONS}

  Create an account identified by ID with optional login and value properties:

  --login.TYPE.PROP=VALUE
  --value.PROP=VALUE

$0 list

  List all accounts by newline separated IDs.

$0 verify ID TYPE {CREDS}

  Verify an ID by the CREDS specific to the TYPE of login.

$0 get ID

  Get the value of an account by its ID as json.

$0 put ID VALUE

  Put a new VALUE (or --value) for an ID that has already been created.

$0 remove ID

  Remove an ID and all its logins.

$0 addlogin ID TYPE {CREDS}

  Add a login TYPE for an existing ID with login-specific properties CREDS.

$0 listlogin ID

  List each active login TYPE for ID on its own line.

$0 rmlogin ID TYPE

  Remove a TYPE login for ID.

$0 help

  Show this message.

```

# install

With [npm](https://npmjs.org) do:

```
npm install accountdown-command
```

# license

MIT
