var async = require('async'),
  levelup = require('level'),
  fs = require('fs');

module.exports = function(argv) {

  if (argv.h) {
    var helpStr = '\
    --path <string> The location of a state DB\n\
    --root <string> The state root in hex\n\
    ';

    console.log(helpStr);
    process.exit();
  }

  var stateDB = levelup(argv.path + 'state');
  var commitDB = levelup(argv.path + 'commit');

  stateDB.get('meta', function(err, data) {
    var meta = JSON.parse(data);

    var entry =  {
      time: Math.round((new Date()).getTime() / 1000),
      description:  argv._[1]
    };

    commitDB.put(meta.root, JSON.stringify(entry), function(){
      console.log('committed root ' + meta.root );
    });
  });
}
