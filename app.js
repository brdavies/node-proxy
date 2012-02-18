var router = require('./proxy.js');

/* Route table. Modify as required. */
var routes = {
  router: {
      'blog.rohben.com'     : 'localhost:8001',
      'www.blog.rohben.com' : 'localhost:8001',      
      'blog.localhost'      : 'localhost:8001'

      /* Add new entries here... */
  }    
};

/*  */
router.run(routes);