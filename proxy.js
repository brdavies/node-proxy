var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy');

/**
 * 
 */
exports.run = function(routes) {

    var arg = require('./args');
    var fmt = require('./sprintf');

    /**
     * Table of command line options. */
    var options = [{
        option   : '-p, --port <number>',
        usage    : 'Port number to listen on.',
        default  : '80'
    }, {
        option   : '-u, --user <name>',
        usage    : 'User to switch to after binding to the port. Only required if binding to port less than 1024.'
    }];

    /**
     * Command line help. */
    var usage = '\
Node.js application to reverse proxy incoming http requests received on a\
specified port to applications listening on other ports. For binding to ports\
less than 1024 the application must be run with root privileges, however if\
specified it will drop back to running as an unprivileged user after binding to\
that port.\
    ';

    /**
     * Current version of this application. */
    var version = "1.0.0";

    /**
     * Helper function to print error messages.
     *
     * @param[in] msg
     *     The error message.
     */
    var app_error = function(msg) {
        process.stderr.write('ERROR: '.red);
        process.stderr.write(msg + '\n');
        process.exit(1);
    };

    /**
     * Helper function to print the status of this application.
     */
    var app_status = function() {

        var str;
        var table = {};
        var from;
        var to;

        for (from in routes.router) {
            if (!routes.router.hasOwnProperty(from)) {
                continue;
            }

            to = routes.router[from];

            if (!table[to]) {
                table[to] = [];
            }
            table[to].push(from);
        }

        for (to in table) {

            table[to].forEach(function(from) {
                console.log("%s", from.blue);
            });
            console.log("==> " + to.green + '\n');
        }

        util.puts('HTTP Proxy listening on port ' + args.port.toString().yellow);
    };
    
    var args = arg.parse(version, usage, options, process.argv);

    if ((args.port < 1024) && (!args.user)) {
        /* If running on a privileged port a user must be specified so the
         * application can drop to that user after opening the port. */
        app_error('User must be specified for port ' + args.port + ' (see --user).');
        process.exit(1);
    }

    var server = httpProxy.createServer(routes);

    server.on('error', function(error) {
        if ((args.port < 1024) && (error.code == 'EACCES')) {
            app_error('Administrator privileges required for port ' + args.port);
        } else {
            app_error(error);
        }
    });


    server.listen(args.port, function() {
        if (args.user) {
            
            /* Drop privileges. */
            process.setuid(args.user);

            app_status();
        }
    });

};