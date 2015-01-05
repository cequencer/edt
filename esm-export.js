#!/usr/bin/env node

var Ethereum = require('ethereumjs-lib'),
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
  async = require('async'),
  parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2), {
  boolean: ['cpp', 'node', 'h'],
  string: ['path', 'root'],
  alias: {
    'help': 'h'
  },
  unknown: function(op) {
    if(op !== 'export'){
      console.error('unrecognized option: ' +  op +' try --h for help');
    }
  }
});

if (argv.h) {
  var helpStr = '\
  --cpp           Reads the cpp clients db\n\
  --node          reads the node.js clients db\n\
  --more          Show the stateRoots and codeHashes of accounts \n\
  --path <string> The location of a state DB\n\
  --root <string> The state root in hex\n\
  ';

  console.log(helpStr);
  process.exit();
}

//set the path
require('./path.js')(argv);

if (!argv.root) {
  try{
    var meta = require(argv.path + '/meta.json');
    argv.root = meta.root;
  }catch(e){
    console.log('this directory does not have a valid state db. \
      try running `esm init` or specifing a path and a root');
  }
}

var Trie = Ethereum.Trie,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils,
  stateDB = levelup(argv.path),
  state = new Trie(stateDB),
  stream = state.createReadStream();

state.root = new Buffer(argv.root, 'hex');

var ts = through(function(data) {

  this.pause()

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

    self.emit('data', parsed)
    self.resume();
  });
});

/* wicked */
stream
  .pipe(ts)
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
