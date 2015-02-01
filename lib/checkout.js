var fs = require('fs'),
  levelup = require('level');

module.exports = function emsLog(argv) {
  
  //TODO: checkout iff root exsists
  var stateDB = levelup(argv.path + 'state');  
  var commitDB = levelup(argv.path + 'commit');

  commitDB.get(function(err, commit){
    if(err){
      console.log('commit ' + argv.root + ' not found');
    } 
    
    stateDB.put('meta', JSON.stringify({
      root: argv.root;
    }), function(){
      console.log(commit);
    });
  });
}
