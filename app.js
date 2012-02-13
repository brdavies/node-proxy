
var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    net_binding = require('net');

var opt = require('optimist');

/**
 * Table of command line options. Each object must have the 's' (short), 'l'
 * (long), and 'usage' properties. Optional properties are 'default'. */
var options = [{
    s       : 'p',
    l       : 'port',
    default : '80',
    usage   : 'Port number to listen on.'
}, {
    s       : 'u',
    l       : 'user',
    usage   : 'User to switch to after binding to the port. Only required if binding to port less than 1024.'
}, {
    s       : 'h',
    l       : 'help',
    usage   : 'Display help for this application.'
}];

/**
 * Command line help.
 *
 * @note For some reason showHelp() doesn't word-wrap usage so terminate each
 * line with '\n'. */
var usage = '\
\n\
Node.js application to reverse proxy incoming http requests received on a\n\
specified port to applications listening on other ports. For binding to ports\n\
less than 1024 the application must be run with root privileges, however if\n\
specified it will drop back to running as an unprivileged user after binding to\n\
the port.\n\
';

opt = opt.wrap(80);
opt = opt.usage(usage);

for (var i = 0; i < options.length; i++) {
    opt = opt.describe(options[i].s, options[i].usage);
    if (options[i].l) {
        opt = opt.alias(options[i].l, options[i].s);
    }
    if (options[i].default) {
        opt = opt.default(options[i].s, options[i].default);
    }
}
var argv = opt.argv;

if (argv.help) {
    opt.showHelp();
    process.exit();    
}

if (argv.port) {
    console.log("port = " + argv.port + "\n");
}
if (argv.user) {
    console.log("user = " + argv.user + "\n");
}

process.exit();

/*  optimist.usage('Create a proxy server'); */
/*  optimist.demand('p'); */
/*  optimist.alias('port', 'p'); */
/*  optimist.describe('port', 'Create a webserver on this port.'); */
/*  var argv = optimist.argv; */

if (argv.port) {
    console.log("port = " + argv.port + "\n");
}



//
// Http Proxy Server with Proxy Table
//
var server = httpProxy.createServer({
  router: {
      'blog.rohben.com'     : 'localhost:8001',
      'www.blog.rohben.com' : 'localhost:8001',
      'test.localhost'      : 'localhost:3000',
      'blog.localhost'      : 'localhost:8001'
  }
});

/*  server.listen(80, function() { */
/*      process.setuid('ben'); */
/*  }); */

//
// Target Http Server
//
/*  http.createServer(function (req, res) { */
/*    res.writeHead(200, { 'Content-Type': 'text/plain' }); */
/*    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2)); */
/*    res.end(); */
/*  }).listen(9000); */

util.puts('http proxy server '.blue + 'started '.green.bold + 'on port '.blue + '8001 '.yellow + 'with proxy table'.magenta.underline);
util.puts('http server '.blue + 'started '.green.bold + 'on port '.blue + '9000 '.yellow); 