/* The local version of command has been modified slightly to change the format
 * of --help. For everything else it is identical. */
var program = require('./commander');


/**
 * Function to parse command line options.
 *
 * @param[in] version
 *     String which describes the version of the application.
 * @param[in] usage
 *     String which describes the program. If the string contains a newline it
 *     will be printed verbatim, otherwise it will be wrapped to fit within the
 *     terminal.
 * @param[in] options
 *     Array of objects where each object describes a valid command line option.
 *     Each object must have the following properties:
 *     
 *     - option (required)
 *       A string which identifies the short and long options and whether the
 *       option accepts a parameter. '-s, --long', '-s, --long <required>', or
 *       '-s, --long [optional]'.
 *         
 *     - usage (required)
 *       A string which describes the option. This string should not include
 *       newlines, it will be automatically formatted.
 *
 *     - default (optional)
 *       Default value for the option.
 * @param[in] argv
 *     Array of command line options (e.g. process.argv).
 */
exports.parse = function(version, usage, options, argv) {
    
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
        /* If there are newlines in the usage string then assume the string has
         * bene explicitly cut, otherwise wrap the text. */
        usage = "\n\n  " + wrap_usage(usage, width - 3, "\n  ", false);
    }

    program = program
        .usage(usage)
        .version(version)
        .parse(argv);

    return (program);
};