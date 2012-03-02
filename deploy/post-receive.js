/**
 * @file post-receive.js
 * 
 * @brief git post-receive script (in javascript).
 *
 * @section usage Usage Instructions
 *
 * -# Copy this post-receive.js file to the 'hooks' directory of your
 *    repository. If gitolite is used to host the repository this will be
 *    something like '/srv/git/repositories/node.proxy.git/hooks'.
 *    
 * -# Edit or create post-receive (a shell script) in the same location (e.g.
 *    '/srv/git/repositories/node.proxy.git/hooks/post-receive') and add:
 *    
 *    node ./hooks/post-receive.js
 *
 * -# Modify @ref action_table to perform different actions when changes are
 *    made to different branches in the repository.
 *
 * @section post_receive Git Post Receive
 *
 * Revisions are fed in to the git post-receive hook from stdin. The input may
 * contain multiple lines formatted as "old_rev new_rev ref". 
 */

/**
 * This table defines what to do when a specific branch is modified. 
 */
var action_table = [{
    branch : "live",
    exec   : "echo"
} , {
    branch : "dev",
    exec   : "echo"
}];

/**
 * This function reads git revision data from stdin and executions actions
 * (defined in @p table) based on what branches have been modified.
 *
 * @param[in] table
 *     This table defines what to do when a specific branch is modified. The 'exec'
 *     key can be one of the following:
 *      
 *     string: a system command to execute. The command receives three arguments,
 *     "old revision", "new revision", and "referenece". For example, if 'exec' is
 *     "echo" the script will print something like "4b6f... 33d1... master" (where
 *     "4b6f..." and "33d1..." are full revisions).
 *      
 *     function: a function to call. The function receives three arguments, "old
 *     revision", "new revision", and "referenece".
 */
var post_receive = function(table) {

    var exec = require('child_process').exec;
    var git_output = "";

    /**
     * This function executes the system command defined by @p cmd, passing
     * it @p rev_old, @p rev_new, and @p branch as command line arguments.
     *
     * @param[in] cmd
     *     A system command to execute (e.g. "echo").
     * @param[in] rev_old
     *     Old git revision (e.g. "4b6f298ae8af9c467ff7c048dacf6a042550ab52").
     * @param[in] rev_new
     *     New git revision.
     * @param[in] branch
     *     The git branch that changed (e.g. "master").
     */
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

post_receive(action_table);