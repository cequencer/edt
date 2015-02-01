var levelup = require('level');

module.exports = function emsLog(argv){
  var commitDB = levelup(argv.path + 'commit');
  var stream = commitDB.createReadStream();
  stream.on('data', function(data){
    console.log('root ' +  data.key);
    var val = JSON.parse(data.value);
    console.log('date ' +  new Date(val.time));
    console.log(val.description + '\n');
  });
}
