var httpProxy = require('http-proxy'),
    http  = require('http');

var options = {
    /*  This is more efficient when routing purely on http 'Host' header. */
    /*  hostnameOnly: true, */

    /*   The routes. */
    router: {
        'lab.rohben.com'  : '127.0.0.1:8081',
        'blog.rohben.com' : '127.0.0.1:8082'
    }
};

var stack = require('stack'),
    creationix = require('creationix');

var rootDirBlog = (process.env.NODE_ROOT_DIR ? process.env.NODE_ROOT_DIR : __dirname +"/..");
rootDirBlog += '/blog.rohben.com';

http.createServer(stack(
  creationix.log(),
  require('wheat')(rootDirBlog)
)).listen(8082);

console.log("rootBlog --> " + rootDirBlog);

var port = (process.env.PRODUCTION ? 80 : 8080);

var server = httpProxy.createServer(options);
server.listen(port);

//
// Listen for the `proxyError` event on `server.proxy`. _It will not
// be raised on the server itself._
server.proxy.on('proxyError', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  
  res.end('Something went wrong. And we are reporting a custom error message.');
});

console.log("Proxy on port " + port);