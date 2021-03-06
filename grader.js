#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var res = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://desolate-atoll-9694.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    if (fs.existsSync(htmlfile)) {
	return cheerio.load(fs.readFileSync(htmlfile));
    } else {
//console.log("not a file - cheerio: " + htmlfile);
        return cheerio.load(htmlfile);
    }
    
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
//console.log(out);
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url_name>', 'URL address')  
    .parse(process.argv);

    var outJson = "";

    if (program.file) {
//          console.log("program.file: " + program.file);
          var checkJson = checkHtmlFile(program.file, program.checks);
          outJson = JSON.stringify(checkJson, null, 4);
          console.log(outJson);
     }
     else if (program.url) {
         res.get(program.url).on('complete', function(result) {
                     if (result instanceof Error) {
                       sys.puts('Error: ' + result.message);
                      } else {
//                        return result;
//                      }
//	  });
//console.log(htmlresult);
			  var checkJson = checkHtmlFile(result, program.checks);
			  outJson =  JSON.stringify(checkJson, null, 4);
			  console.log(outJson);
		      }
	     });
//                      console.log(outJson);
     }
//console.log("post if check...");
//     console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
