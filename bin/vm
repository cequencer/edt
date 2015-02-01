#!/usr/bin/env node
const ethereum = require('ethereumjs-lib');
const Trie = ethereum.Trie;
const VM = ethereum.VM;
const Account = ethereum.Account;
const Block = ethereum.Block;
const Tx = ethereum.Transaction;
const ethUtils = ethereum.utils;
const ecdsa = require('secp256k1');
const async = require('async');

var trie = new Trie();

const privateKey = new Buffer('5b95ff212bd185d2719c8c8f87bf01b50e31ef625de8e94dc64afd2624e8ef4c', 'hex');
const publicKey = new Buffer('04f691e8a6a3c4fe15c5580641dea51c06880fa52d96b0ab863ce30f6dc655939773defb3d2e9d5b79ddd1d1f26677834520e042c958c6c7facdc125b5c2dbcf36', 'hex');

var code = process.argv[2];
console.log('code' + code.toString('hex'));

function setupAccount(cb) {
  var address = ethUtils.pubToAddress(publicKey);
  //store  the account
  var account = new Account();
  account.balance.fill(255);
  trie.put(address, account.serialize(), cb);
}

function onStep(info, done){
  console.log("value");
  done();
}

function runTx(cb) {
  var tx = new Tx();
  tx.data = code;
  tx.sign(privateKey);
  tx.gasLimit = new Buffer([1,0,0,0,0,0,0]);

  var block = new Block();
  var vm = new VM(trie);

  vm.onStep = onStep;
  vm.runTx(tx, block, cb)
}

async.series([
  setupAccount,
  runTx
], function() {
  console.log('done!');
});
