var levelup = require('level');
var async = require('async');
var Ethereum = require('ethereumjs-lib');
var crypto = require('crypto');
var ecdsa = require('secp256k1');
var Account = Ethereum.Account;
var ethUtils = Ethereum.utils;
var Trie = Ethereum.Trie;

module.exports = function account(argv) {
  var stateDB = levelup(argv.path + 'state');
  var state = new Trie(stateDB);

  function updateAccount(address, account, argv, cb) {

    if (argv.balance) {
      account.balance = argv.balance;
    }

    if (argv.nonce) {
      account.nonce = argv.nonce;
    }

    async.series([
      function(done) {
        if (argv.storage) {
          var strie = new Trie(stateDB);
          var storage = [argv.storage];
          storage.concat(argv._.slice(2));
          async.eachSeries(storage, strie.put, function() {
            account.stateRoot = strie.root;
            done();
          });
        } else {
          done();
        }
      },
      function(done) {
        if (argv.code) {
          account.storeCode(state, argv.code, done)
        }
      },
      state.put.bind(state, address, account.serialize())
    ], cb);
  }

  switch (argv._[1]) {
    case 'add':
      if (argv.key) {
        var sk = new Buffer(argv.key, 'hex');
      } else {
        var sk = crypto.pseudoRandomBytes(32);
      }

      var pk = ecdsa.createPublicKey(sk);
      var address = ethUtils.pubToAddress(pk);
      var account = new Account();

      updateAccount(address, account, argv, function(){
        console.log('account created');
        console.log('address: ' + address.toString('hex'));
        console.log('private key: ' + sk.toString('hex'));
        console.log('public key: ' + pk.toString('hex'));
      });

      break;
    case 'remove':
      var address = argv.address;
      stateDB.del(address, Account.serialize(), function() {
        console.log('account: ' + address + ' deleted');
      });
      break;
    case 'update':
      stateDB.get(argv.address, function(err, data){
        if(data){
        updateAccount(argv.address, argv, new Account(data), function(){
          console.log('account updated');
        });
        }else{
          console.log('account not found');
        }
      });
    case 'name':
      stateDB.get(argv.address, function(err, data){
        if(data){
          
        }
      });
      break

    default:
      console.error('invalid argument: ' + argv._[1]);

  }

};
