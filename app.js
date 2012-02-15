
var util = require('util'),
    colors = require('colors'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    net_binding = require('net');

var program = require('commander');

/**
 * Table of command line options. Each object must have the following
 * properties:
 * - option: 
 *
 * Optional properties:
 * default: default value for the option.
 * 
 * 'opt' and 'usage'
 * properties. Optional properties are 'default'. */
var options = [{
    option   : '-p, --port <number>',
    usage    : 'Port number to listen on.',
    default  : '80'
}, {
    option   : '-u, --user <name>',
    usage    : 'User to switch to after binding to the port. Only required if binding to port less than 1024.'
}];

/**
 * Command line help.
 *
 * @note For some reason showHelp() doesn't word-wrap usage so terminate each
 * line with '\n'. */
var usage = '\
Node.js application to reverse proxy incoming http requests received on a\
specified port to applications listening on other ports. For binding to ports\
less than 1024 the application must be run with root privileges, however if\
specified it will drop back to running as an unprivileged user after binding to\
that port.\
';

/**
 * Word wrap at a specified column.
 *
 * @return
 *     The resulting string.
 * @param[in] str
 *     The string to be word-wrapped.
 * @param[in] width
 *     Column width (default 75).
 * @param[in] brk
 *     The characters to be inserted at every break.
 * @param[in] cut
 *     If the cut is set to TRUE, the string is always wrapped at or before
 *     the specified width. So if you have a word that is larger than the
 *     given width, it is broken apart.
 */
var wrap_usage = function(str, width, brk, cut) {

    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;

    if (!str) { return str; }

    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

    return str.match( RegExp(regex, 'g') ).join( brk );

};

var width = process.stdout.getWindowSize()[0];

if ((width > 80) || (width < 10)) {
    width = 80;
}

for (i = 0; i < options.length; i++) {
    var help = wrap_usage(options[i].usage, width - 11, "\n      ", true);
    program = program.option(
        options[i].option, "\n      " + help + "\n", options[i].default
    );
}

if (usage.indexOf('\n', 0) < 0) {
    /* If there are newlines in the usage string then assume the string has bene
     * explicitly cut, otherwise wrap the text. */
    usage = "\n\n  " + wrap_usage(usage, width - 3, "\n  ", false);
}

program = program
    .usage(usage)
    .version('0.0.1')
    .parse(process.argv);

console.log("port %d\n", program.port);
console.log("user " + program.user);


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