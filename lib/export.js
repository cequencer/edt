var Ethereum = require('ethereumjs-lib'),
  rlp = require('rlp'),
  Block = Ethereum.Block,
  levelup = require('level'),
  through = require('through'),
  JSONStream = require('JSONStream'),
  async = require('async');

var Trie = Ethereum.Trie,
  rlp = Ethereum.rlp,
  utils = Ethereum.utils;

module.exports = function(argv, state, stateDB) {
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


  if (!argv.root && argv.cpp) {
    //loads the cpp best root
    var detailsDB = levelup(argv.path + 'details');
    var blocksDB = levelup(argv.path + 'blocks');

    detailsDB.get('best', {
      encoding: 'binary'
    }, function(err, best) {
      blocksDB.get(best, {
        encoding: 'binary'
      }, function(err, block) {
        var b = new Block(rlp.decode(block));
        state.root = b.header.stateRoot;
        dumpState();
      });
    });
  } else if (!argv.root) {
    try {
      var meta = require(argv.path + 'meta.json');
      argv.root = meta.root;
    } catch (e) {
      console.log('could not find a valid root');
      process.exit();
    }
  } else {
    state.root = new Buffer(argv.root, 'hex');
    dumpState();
  }

  function dumpState() {
    var stream = state.createReadStream();
    var ts = through(function(data) {

      this.pause();

      var self = this;
      var key = data.key.toString('hex');
      var value = utils.baToJSON(rlp.decode(data.value));
      var parsed = {
        nonce: value[0],
        balance: value[1],
        stateRoot: value[2],
        codeHash: value[3],
        code: '',
        storage: {}
      };

      function loadCode(done) {
        if (parsed.codeHash !== utils.SHA3_NULL) {
          stateDB.get(new Buffer(parsed.codeHash, 'hex'), {
            encoding: 'binary'
          }, function(err, code) {
            parsed.code = code.toString('hex');
            done();
          });
        } else {
          done();
        }
      }

      function loadState(done) {
        var storage = new Trie(stateDB);
        storage.root = new Buffer(parsed.stateRoot, 'hex');
        var sstream = storage.createReadStream();

        sstream.on('data', function(data) {
          parsed.storage[data.key.toString('hex')] = data.value.toString('hex');
        });

        sstream.on('end', done);
      }

      async.parallel([loadCode, loadState], function() {
        if (!argv.more) {
          delete parsed.stateRoot;
          delete parsed.codeHash;
        }

        self.emit('data', [key, parsed]);
        self.resume();
      });

    });

    /* wicked */
    stream
      .pipe(ts)
      .pipe(JSONStream.stringifyObject())
      .pipe(process.stdout);
  }

};


