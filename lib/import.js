var Ethereum = require('ethereumjs-lib'),
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
  async = require('async'),
  fs = require('fs');

var Trie = Ethereum.Trie,
  Account = Ethereum.Account,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils;

module.exports = function(argv) {

  var helpStr = '\
  usage: import [path_to_state_dump.json] --path \n\
  \n\
  --path <string> The location of a state DB\n\
  ';

  if (argv.h || !argv._.length) {
    console.log(helpStr);
    process.exit();
  }

  var stateDB = levelup(argv.path + 'state'),
    state = new Trie(stateDB);

  var rstream = fs.createReadStream(argv._[1]).pipe(JSONStream.parse('*', function(item, path) {
    item.address = path[path.length - 1];
    return item;
  }));

  var q = async.queue(function(data, callback) {

    var account = new Account();
    account.balance = data.balance;
    account.nonce = data.nonce;
    account.storeCode(state, new Buffer(data.code, 'hex'), function() {});

    storage = new Trie(stateDB);

    async.each(Object.keys(data.storage), function(key, done) {
      var val = data.storage[key];
      storage.put(new Buffer(key, 'hex'), new Buffer(val, 'hex'), done);
    }, function() {
      account.stateRoot = storage.root;
      state.put(new Buffer(data.address, 'hex'), account.serialize(), callback);
    });
  }, 1);

  q.drain = function() {
    stateDB.put('meta', JSON.stringify({
      root: state.root.toString('hex')
    }));
  };

  rstream.on('data', function(data, key) {
    q.push(data);
  });
}
