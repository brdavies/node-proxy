
var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    net_binding = require('net');

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

var args = arg.parse("0.0.1", usage, options, process.argv);

console.log("port %d\n", args.port);
console.log("user " + args.user);


process.exit();

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