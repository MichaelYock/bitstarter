#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var checksfile = (program.checks);

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioUrl = function(html){
     		return cheerio.load(html);
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checksfile) {
    $ = cheerioHtmlFile(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Target URL')
        .parse(process.argv);
    var checkJson = checkHtml(program.file, program.checks);
    if (program.url){
        var callback = function(cont){
       		$ = cheerioUrl(cont);
   		var checks = loadChecks(program.checks).sort();
    		var out = {};
    		for(var ii in checks) {
        		var present = $(checks[ii]).length > 0;
        		out[checks[ii]] = present;
   		};
		console.log(out);
    		return out;
    	}
	
    	var checkJson = rest.get(program.url).on('complete', function(cont) {callback(cont);});
   }else{    
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    }
};
