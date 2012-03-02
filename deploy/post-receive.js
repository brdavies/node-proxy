var table = [{
    branch : "c",
    exec   : "echo"
} , {
    branch : "g",
    exec   : function(rev_old, rev_new, branch) {
        console.log("old    = " + rev_old);
        console.log("new    = " + rev_new);
        console.log("branch = " + branch);
    }
}];

var post_receive = function(table) {

    var exec = require('child_process').exec;
    var git_output = "";

    var run = function(cmd, rev_old, rev_new, branch) {
        var c = exec(cmd + " " + rev_old + " " + rev_new + " " + branch);

        c.stdout.on('data', function(data) {
            console.log(data);
        });

        c.stderr.on('data', function(data) {
            console.log(data);
        });

        c.on('exit', function(code) {
        });
    };
    
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
        git_output += chunk;
    });
    
    process.stdin.on('end', function() {

        /* Revisions are fed in to the git post-receive hook from stdin. Each
         * input line is formatted as "old_rev new_rev ref". Break up each line
         * in to parts and use the 'table' input paramter to figure out what to
         * do with the data. */

        var refs = git_output.split("\n");
        var ref;

        refs.forEach(function(ref) {

            if (ref) {
                var revs = ref.split(" "),
                    rev_old = revs[0],
                    rev_new = revs[1],
                    branch = revs[2];

                if (branch) {
                    branch = branch.split("/").pop();
                }

                table.forEach(function(entry) {
                    console.log("entry.branch = " + entry.branch);
                    console.log("branch       = " + branch);
                    console.log("typeof       = " + typeof(entry.exec));
                    if (entry.branch == branch) {
                        switch (typeof(entry.exec)) {
                        case "string" :
                            run(entry.exec, rev_old, rev_new, branch);
                            break;
                        case "function" :
                            entry.exec(rev_old, rev_new, branch);
                            break;
                        };
                    }
                });

            }
        });
    });
};

post_receive(table);