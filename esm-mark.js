#!/usr/bin/env node

var async = require('async'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['h'],
  alias: {
    'help': 'h'
  }
});

if (argv.h) {
  var helpStr = '\
  --path <string> The location of a state DB\n\
  --root <string> The state root in hex\n\
  ';

  console.log(helpStr);
  process.exit();
}

//set the path
require('./path.js')(argv);

if (!argv.root) {
  try{
    var meta = require(argv.path + '/meta.json');
    argv.root = meta.root;
  }catch(e){
    console.log('this directory does not have a valid ethereum folder. \
      try running `esm init` or specifing a path');
  }
}

fs.appendFile(argv.path+'/marks', 'data to append', function (err) {

});
