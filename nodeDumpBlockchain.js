var levelup = require('level');
var Block = require('ethereumjs-lib').Block;
var async = require('async');
var rlp = require('rlp');

var detailsDB = levelup('/home/TODO/.ethereum/node/details');
var blocksDB = levelup('/home/TODO/.ethereum/node/block');

detailsDB.get('meta', {
  encoding: 'json'
}, function(err, best) {
  best = new Buffer(best.head, 'hex');

  var more = true;
  var blocks = [];

  async.whilst(function() {
    return more;
  }, function(done) {
    blocksDB.get(best, {encoding: 'binary'}, function(err, val){
//console.log('val: ', val)
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

/*
var stream = blocksDB.createReadStream();
stream.on('data', function(data) {
  console.log('data: ', data)
});
*/
