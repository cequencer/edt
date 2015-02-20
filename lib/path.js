var fs = require('fs'),
  path = require('path');

//attemps gets th3 path of etheruem's state db
module.exports = function(argv) {
  if (argv.cpp) {
    argv.path = process.env.HOME + '/.ethereum/AlethZero/';
  } else if (argv.node) {
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
