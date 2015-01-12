#!/usr/bin/env node

var fs = require('fs'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['h', 'init'],
  string: ['path', 'root'],
  alias: {
    'help': 'h'
  }
});

//set the path
require('./path.js')(argv);

switch (argv._[0]) {
  case 'init':
    console.log('initializing state db');
    fs.mkdir('./.ethereum', function() {});
    break;

  case 'export':
    require('./esm-export.js')(argv);
    break;

  case 'import':
    require('./esm-import.js')(argv);
    break;

  case 'commit':
    require('./esm-commit.js')(argv);
    break;

  case 'checkout':
    require('./esm-checkout.js')(argv);
    break;

  case 'log':
    require('./esm-log.js')(argv);
    break;

  case 'account':
    require('./esm-account.js')(argv);
  break;

  case 'status':
    require('./esm-status.js')(argv);
  break;

  default:
    var helpStr = '\
    usage: import [path_to_state_dump.json] --path \n\
    --path <string> The location of a state DB\n\
    ';

    console.log(helpStr);
}
