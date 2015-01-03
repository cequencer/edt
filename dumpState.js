#!/usr/bin/env node

var Ethereum = require('ethereumjs-lib'),
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
  async = require('async'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['pp', 'cpp', 'node', 'h'],
  string: ['i', 'root'],
  default: {},
  unknown: function() {
    console.error('unrecognized option. try --h for help');
    process.exit();
  }
});

if (argv.h) {
  var helpStr = '\
  --cpp           Reads the cpp clients db\n\
  --node          reads the node.js clients db\n\
  --more          Show the stateRoots and codeHashes of accounts \n\
  --i <string>    The location of some state DB\n\
  --root <string> The state root in hex\n\
  ';

  console.log(helpStr);
  process.exit();
}

if (!argv.root) {
  console.error('must specify a root');
  process.exit();
}

if (argv.cpp) {
  argv.i = process.env.HOME + '/.ethereum/AlethZero/state';
} else if (argv.node) {
  argv.i = process.env.HOME + '/.ethereum/node/state';
}

var Trie = Ethereum.Trie,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils,
  stateDB = levelup(argv.i),
  state = new Trie(stateDB),
  stream = state.createReadStream();

//put the state root here
state.root = new Buffer(argv.root, 'hex');

var ts = through(function write(data) {
  var self = this;
  var key = data.key.toString('hex');
  var value = utils.baToJSON(rlp.decode(data.value));
  var parsed = {
    address: key,
    nonce: value[0],
    balance: value[1],
    stateRoot: value[2],
    codeHash: value[3],
    code: '',
    storage: []
  };

  function loadCode(done) {
    if (parsed.codeHash !== utils.SHA3_NULL) {
      stateDB.get(new Buffer(parsed.codeHash, 'hex'), {encoding:'binary'},  function(err, code) {
        parsed.code = code.toString('hex');
        done();
      })
    } else {
      done();
    }
  }

  function loadState(done){
    var storage = new Trie(stateDB);
    storage.root = new Buffer(parsed.stateRoot,'hex');
    var sstream = storage.createReadStream();

    sstream.on('data', function(data){
      parsed.storage.push({
        key: data.key.toString('hex'),
        value: data.value.toString('hex')
      });
    });

    sstream.on('end', done);
  }

  async.parallel([loadCode, loadState], function(){
    if (!argv.more) {
      delete parsed.stateRoot;
      delete parsed.codeHash;
    }

    self.queue(parsed); //data *must* not be null
  });

});

stream.pipe(ts);

if (!argv.pp) {
  ts = ts.pipe(JSONStream.stringify());
}

ts.pipe(process.stdout);
