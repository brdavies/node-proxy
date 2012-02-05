var http_proxy = require('http-proxy'),
    http  = require('http');

var backend, backends, find_backend, i, proxyserver, standard_options, _i, _len;

backends = [
    {
        name  : 'blog.rohben.com',
        host  : 'http://127.0.0.1:8081',
        paths : ['']
    },
    {
        name  : 'lab.rohben.com',
        host  : 'http://127.0.0.1:8082',
        paths : ['']
    }
];

standard_options = function(t) {
    return {
        target: {
            host: t.hostname,
            port: t.port,
            https: t.protocol === 'https:'
        },
        enable: {
            xforward: true
        }
    };
};

for (_i = 0, _len = backends.length; _i < _len; _i++) {
    backend = backends[_i];
    backend.paths = (function() {
        var _j, _len2, _ref, _results;
        _ref = backend.paths;
        _results = [];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            i = _ref[_j];
            _results.push(new RegExp(i));
        }
        return _results;
    })();
    backend.options = standard_options(url.parse(backend.host));
}

find_backend = function(req) {
    var backend, m, path, pathname, _j, _k, _len2, _len3, _ref;
    pathname = url.parse(req.url).pathname;
    for (_j = 0, _len2 = backends.length; _j < _len2; _j++) {
        backend = backends[_j];
        _ref = backend.paths;
        for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
            path = _ref[_k];
            m = path.exec(pathname);
            if (m) return backend;
        }
    }
    return null;
};

proxyserver = httpProxy.createServer(function(req, res, proxy) {
    backend = find_backend(req);
    if (backend) {
        proxy.proxyRequest(req, res, backend.options);
        return this;
    }
    try {
        res.writeHead(404);
        res.end();
    } catch (error) {
        console.error("res.writeHead/res.end error: %s", error.message);
    }
    return;
});

proxyserver.listen(80);

/*  var options = { */
/*      /\*  This is more efficient when routing purely on http 'Host' header. *\/ */
/*      /\*  hostnameOnly: true, *\/ */

/*      /\*   The routes. *\/ */
/*      router: { */
/*          'lab.rohben.com'  : '127.0.0.1:8081', */
/*          'blog.rohben.com' : '127.0.0.1:8082' */
/*      } */
/*  }; */

/*  var stack = require('stack'), */
/*      creationix = require('creationix'); */

/*  var rootDirBlog = (process.env.NODE_ROOT_DIR ? process.env.NODE_ROOT_DIR : __dirname +"/.."); */
/*  rootDirBlog += '/blog.rohben.com'; */

/*  http.createServer(stack( */
/*    creationix.log(), */
/*    require('wheat')(rootDirBlog) */
/*  )).listen(8082); */

/*  console.log("rootBlog --> " + rootDirBlog); */

/*  var port = (process.env.PRODUCTION ? 80 : 8080); */

/*  var server = httpProxy.createServer(options); */
/*  server.listen(port); */

/*  // */
/*  // Listen for the `proxyError` event on `server.proxy`. _It will not */
/*  // be raised on the server itself._ */
/*  server.proxy.on('proxyError', function (err, req, res) { */
/*    res.writeHead(500, { */
/*      'Content-Type': 'text/plain' */
/*    }); */

/*    res.end('Something went wrong. And we are reporting a custom error message.'); */
/*  }); */

/*  console.log("Proxy on port " + port); */