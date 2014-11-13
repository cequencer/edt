#!/usr/bin/env node

var Ethereum = require('ethereum-lib'),
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
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

if(argv.h){
  var helpStr = '\
  --pp            Prettish print. if now given defaults to JSON\n\
  --cpp           Reads the cpp clients db\n\
  --node          reads the node.js clients db\n\
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

var  Trie = Ethereum.Trie,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils,
  stateDB = levelup(argv.i),
  state = new Trie(stateDB),
  stream = state.createReadStream();

//put the state root here
state.root = new Buffer(argv.root, 'hex');

var ts = through(function write(data) {
  var key = data.key.toString('hex');
  var value =  utils.BAToJSON(rlp.decode(data.value));
  var parsed;

  if(argv.pp){
    //pretty print
    parsed =  'key: ' + key;
    parsed += 'decoded: ' + value  + '\n\n';
  }else{
    //json
    parsed =  {
      key:  key,
      value: value
    };
  }

  this.queue(parsed); //data *must* not be null
});

stream.pipe(ts);

if(!argv.pp){
  ts = ts.pipe(JSONStream.stringify());
}

ts.pipe(process.stdout);
