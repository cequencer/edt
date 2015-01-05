#!/usr/bin/env node

var Ethereum = require('ethereumjs-lib'),
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
  async = require('async'),
  fs = require('fs'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['h'],
  string: ['path']
});

var helpStr = '\
  usage: import [path_to_state_dump.json] --path \n\
  --path <string> The location of a state DB\n\
  ';

if (argv.h || !argv._.length) {
  console.log(helpStr);
  process.exit();
}

//set the path
require('./path.js')(argv);

var Trie = Ethereum.Trie,
  Account = Ethereum.Account,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils,
  stateDB = levelup(argv.path),
  state = new Trie(stateDB);

var rstream = fs.createReadStream(argv._[0]).pipe(JSONStream.parse('*'));

var q = async.queue(function (data, callback) {
  var account = new Account();
  account.balance = data.balance;
  account.nonce = data.nonce;
  account.storeCode(state, new Buffer(data.code, 'hex'), function() {});

  storage = new Trie(stateDB);

  async.each(data.storage, function(kv, done) {
    storage.put(new Buffer(kv.key, 'hex'), new Buffer(kv.value, 'hex'), done);
  }, function() {
    account.stateRoot = storage.root;
    state.put(new Buffer(data.address, 'hex'), account.serialize(), function() {
      callback();
    });
  });
}, 1);

q.drain = function(){
  fs.writeFileSync(argv.path + '/meta.json', JSON.stringify({root: state.root.toString('hex')}));
};

rstream.on('data', function(data) {
  q.push(data);
});
