#!/usr/bin/env node

var fs = require('fs'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['h', 'init'],
  string: ['path'],
  alias: {
    'help': 'h'
  }
});

switch (argv._[0]) {
  case 'init':
    console.log('initializing state db');
    fs.mkdir('./.ethereum', function() {});
    break;
  case 'export':
    require('./esm-export.js');
    break;
  case 'import':
    require('./esm-import.js');

  case 'mark':
    require('./esm-mark.js');

  case 'account':
    require('./esm-account.js');

  case 'status':
    require('./esm-status.js');

  default:
    var helpStr = '\
    usage: import [path_to_state_dump.json] --path \n\
    --path <string> The location of a state DB\n\
    ';

    console.log(helpStr);
}
