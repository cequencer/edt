var level = require('level')
var async = require('async')
var Eth = require('ethereumjs-lib')
var assert = require('assert')
var Account = Eth.Account
var crypto = require('crypto')
var spawn = require('child_process').spawn
var fs = require('fs')
var Trie = Eth.Trie

var db = level(__dirname + '/tmp/state')
var trie = new Trie(db)
var randomStrings = []
var root

describe('testing esm', function() {
  it('should populate the trie', function(done) {
    for (var i = 0; i < 100; i++) {
      var rv = crypto.randomBytes(32);
      randomStrings.push(rv);
    }

    async.forEach(randomStrings, function(rs, done2) {
      trie.put(rs, (new Account()).serialize(), done2)
    }, function() {
      root = trie.root;
      done()
    })
  })

  it('should export everything in the trie', function(done) {
    trie.db.close(function() {

      var exported = ''
      var emsExport = spawn(__dirname + '/../bin/esm', ['export', '--path', __dirname + '/tmp', '--root', root.toString('hex')])

      emsExport.stdout.on('data', function(data) {
        exported += data
      });

      emsExport.stderr.on('data', function(data) {
        done(data.toString());
      })

      emsExport.on('close', function() {
        var parsed = JSON.parse(exported);
        randomStrings.forEach(function(rs) {

          rs = rs.toString('hex')

          if (!parsed[rs])
            done('missing key')
        });

        fs.writeFileSync(__dirname + '/tmp.json', exported)

        done()
      })
    })
  })

  it('should import', function(done) {
    var emsImport = spawn(__dirname + '/../bin/esm', ['import', __dirname + '/tmp.json', '--path', __dirname + '/tmp2'])

    emsImport.stderr.on('data', function(data) {
      done(data.toString())
    })

    emsImport.on('close', function() {
      done()
    })
  })

  it('should export everything that was imported', function(done) {

    var exported = ''
    var emsExport = spawn(__dirname + '/../bin/esm', ['export', '--path', __dirname + '/tmp2', '--root', root.toString('hex')])

    emsExport.stdout.on('data', function(data) {
      exported += data;
    });

    emsExport.stderr.on('data', function(data) {
      done(data.toString())
    })

    emsExport.on('close', function() {
      var parsed = JSON.parse(exported);
      randomStrings.forEach(function(rs) {

        rs = rs.toString('hex')

        if (!parsed[rs])
          done('missing key')
      });

      fs.writeFileSync(__dirname + '/tmp2.json', exported)

      done()
    })
  })

  it('the two exports should be the same', function(){
    var a = require(__dirname + '/tmp.json')
    var b = require(__dirname + '/tmp2.json')
    assert.deepEqual(a, b)
  })

  it('it should commit', function(done){
    var emsCommit = spawn(__dirname + '/../bin/esm', ['commit', 'this is a test' , '--path', __dirname + '/tmp2'])

    emsCommit.stderr.on('data', function(data) {
      done(data.toString());
    })

    emsCommit.on('close', function(){
      done();
    });
  })

  it('it should create a log', function(done){
    var emsLog = spawn(__dirname + '/../bin/esm', ['log', '--path', __dirname + '/tmp2'])

    emsLog.stderr.on('data', function(data) {
      done(data.toString());
    })

    emsLog.on('close', function(){
      done();
    })
  })
    
  it('it should give a status', function(done){
    var emsStatus = spawn(__dirname + '/../bin/esm', ['status', '--path', __dirname + '/tmp2'])

    emsStatus.stderr.on('data', function(data) {
      done(data.toString());
    })

    emsStatus.on('close', function(){
      done();
    })
  })

  it('it should add an account', function(done){
    var emsAccount = spawn(__dirname + '/../bin/esm', ['account', 'add', '--path', __dirname + '/tmp2'])

    emsAccount.stderr.on('data', function(data) {
      done(data.toString());
    })

    emsAccount.on('close', function(){
      done();
    })
  })
})
