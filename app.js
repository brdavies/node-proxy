var proxy = require('http-proxy'),
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

var proxyServer = proxy.createServer(options);
proxyServer.listen(80);

console.log("Proxy on port " + 80);