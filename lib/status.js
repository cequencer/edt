var levelup = require('level');



module.exports = function(argv){

  var stateDB = levelup(argv.path + 'state');
  var commitDB = levelup(argv.path + 'commit');
  stateDB.get('meta', function(err, data ){
    var meta = JSON.parse(data);
    
    commitDB.get(meta.root, function(err, commit ){
      if(commit){
        commit = JSON.parse(commit);
        console.log('root ' + meta.root);
        console.log('data ' + (new Date(commit.time)));
        console.log(commit.description);
      }else{
        console.log('uncommited state with root: ' + meta.root);
      }
    });
  });
}
