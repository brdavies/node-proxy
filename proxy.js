var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    cluster = require('cluster');

/**
 * Start the proxy server.
 */
exports.run = function(routes) {

    var arg = require('./args');

    /**
     * Table of command line options. */
    var options = [{
        option   : '-p, --port <number>',
        usage    : 'Port number to listen on.',
        default  : '80'
    }, {
        option   : '-u, --user <name>',
        usage    : 'User to switch to after binding to the port. Only required if binding to port less than 1024.'
    }, {
        option   : '-w, --workers [count]',
        usage    : 'Number of worker threads.',
        default  : '1'
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

    /* Use commander.js to parse command line arguments. */
    var args = arg.parse(version, usage, options, process.argv);

    if ((args.port < 1024) && (!args.user)) {
        /* If running on a privileged port a user must be specified so the
         * application can drop to that user after opening the port. */
        app_error('User must be specified for port ' + args.port + ' (see --user).');
        process.exit(1);
    }    

    /**
     * Helper function to print error messages.
     *
     * @param[in] msg
     *     The error message.
     */
    var app_error = function(msg, no_exit) {
        process.stderr.write('ERROR: '.red);
        process.stderr.write(msg + '\n');
        if (!no_exit) {
            app_exit(1);
        }
    };

    /**
     * Helper function to print status messages.
     *
     * @param[in] msg
     *     The message to print.
     */
    var app_info = function(msg) {
        process.stderr.write('INFO : '.green);
        process.stderr.write(msg + '\n');
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
            console.log("\nRouting:".green);
            table[to].forEach(function(from) {
                console.log("%s", from.blue);
            });
            console.log("==> " + to.green);
        }

        util.puts('\nHTTP Proxy listening on port ' + args.port.toString().yellow);
    };

    var server;
    var worker_count = 0;
    var workers = {};

    var worker_start = function() {

        var worker = cluster.fork();

        workers[worker.pid] = worker;

        worker.on('message', function(msg) {
            if (msg.cmd == 'ready') {
                worker_count++;
                app_info(
                    "Worker " + worker_count +
                        " of " + args.workers +
                        " online.");
                if (worker_count == args.workers) {
                    app_status();

                    /* Drop privileges. */
                    process.setuid(args.user);
                }
            }
        });
    };

    var app_start = function() {

        if ((args.workers > 1) && (cluster.isMaster)) {
            for (var i = 0; i < args.workers; i++) {
                worker_start();
            }

            cluster.on('death', function(worker) {
                app_error('Worker ' + worker.pid + ' died.', 1);
                delete workers[worker.pid];
                worker_count--;
                worker_start();
            });

        } else {
            server = httpProxy.createServer(routes);

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
                }
                if (args.workers <= 1) {
                    /* There are no child processes (workers), print some useful
                     * information. */
                    app_status();
                } else {
                    process.send({ cmd: 'ready' });
                }
            });
        }
    };

    var app_exit = function(status, signal) {
        if (server) {
            server.close();
            server = undefined;
        }
        if (cluster.isMaster) {
            console.log("");
            for (var pid in workers) {
                if (!workers.hasOwnProperty(pid)) {
                    continue;
                }
                try {                    
                    app_info("Kill child " + pid);
                    process.kill(pid);
                } catch (e) {
                    console.log(e);
                }
            }
            if (signal) {
                signal = " (" + signal + ")";
            }
            
            app_info("Exit" + signal + " with status " + status);
        }
        
        process.exit(status);
    };

    process.on("SIGKILL", function() { app_exit(0, "SIGKILL"); });
    process.on("SIGTERM", function() { app_exit(0, "SIGTERM"); });
    process.on("SIGINT", function() { app_exit(0, "SIGINT"); });

    app_start();
};