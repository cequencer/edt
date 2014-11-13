var levelup = require('levelup');
var Block = require('ethereumjs-lib').Block;
var async = require('async');
var rlp = require('rlp');

var detailsDB = levelup('/home/null/.ethereum/AlethZero/details');
var blocksDB = levelup('/home/null/.ethereum/AlethZero/blocks');

detailsDB.get('best', {
  encoding: 'binary'
}, function(err, best) {

  var more = true;
  var blocks = [];

  async.whilst(function() {
    return more;
  }, function(done) {
    blocksDB.get(best, {encoding: 'binary'}, function(err, val){
        if(!err){
          var block = new Block(rlp.decode(val));
          blocks.push( {block: block.toJSON(), hash: block.hash().toString('hex')}); 
          best = block.header.parentHash; 
        }
        done(err);
    });
  }, function() {
    console.log(JSON.stringify(blocks));
  });
});
