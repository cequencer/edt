//All stuff that is implenention dependant stuff goes here

const levelup = require('level');
const sublevel = require('level-sublevel');
const fs = require('fs');
const path = require('path');

var subdb;
var implemention; 


exports.path = function(argv) {
  if (argv.cpp) {
    implemention = 'cpp';
    argv.path = process.env.HOME + '/.ethereum/AlethZero/';
  } else if (argv.node) {
    implemention = 'node';
    argv.path = process.env.HOME + '/.ethereum/node/';
  } else if (!argv.path) {
    var basePath = process.cwd();
    var statePath = '/.ethereum/';

    //iterate up through the file system
    while(!fs.existsSync(basePath + statePath) && basePath !== '/'){
      basePath = path.resolve(basePath, '..');
    }

    if(basePath === '/'){
      throw new Error('not in a ethereum folder');
    }else{
      argv.path = basePath + statePath;
    }
  }

  if(argv.path.slice(-1) !== '/'){
    argv.path += '/'
  }
}

//deterimes the db type and returns an instance of leveldb
exports.getDB = function(type, argv) {
  var db;

  if (fs.existsSync(argv.path + type)) {
    implemention = 'cpp';
    db = levelup(argv.path + type);
  } else if (fs.existsSync(argv.path)) {
    implemention = 'node'
    //else using sublevel
    //try level-sublevel
    if(!subdb){
      var path = argv.path.slice(0, -1)
      subdb = sublevel(levelup(path));
    }
    db = subdb.sublevel(type);
  } else {
    console.log('invalid path, no db found');
    process.exit();
  }

  return db;
}

exports.getBest = function(db, cb){

  if(implemention === 'cpp'){
    db.get('best', {
      keyEncoding: 'binary',
      valueEncoding: 'binary'
    }, function(err, val){
      cb(val);
    });
  }else{
    db.get('meta',  function(err, val){
      var meta = JSON.parse(val);
      cb(new Buffer(meta.head, 'hex'));
    });
  }
}
