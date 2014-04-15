'use strict';

var user, port;
startup();

var fs = require('fs');
var express = require('express');
var consolidate = require('consolidate');

var server = express(); // better instead
server.use(express.static(__dirname));
server.use(express.static(__dirname + '/public'));
parseSlidesDir('slides', setupRoutes);
// server.use('/test', express.static(__dirname + '/slides/test'));
// server.use('/test', express.static(__dirname + '/public'));

server.listen(port);
console.log('server started at: ' + port);

function parseSlidesDir(startDir, doneCb){
  var routes = [];
  fs.readdir(startDir, function(err, files){
    if(err){ return doneCb(err);}
    var numFiles = files.length;
    if(!numFiles) { return doneCb('empty directory');}
    files.forEach(function(file){
      fs.stat(startDir + '/' + file, function(err, stats){
        if(stats && stats.isDirectory()){
          routes.push(file);
        }
        numFiles --;
        if(numFiles === 0){
          return doneCb(null, routes);
        }
      });
    });
  });
}

function setupRoutes(err, routes){
  console.log(err);
  routes.forEach(function(route){
    console.log(route);
    server.use('/' + route, express.static(__dirname + '/slides/' + route));
    server.use('/' + route, express.static(__dirname + '/public'));
  });
}

function startup(){
  console.log('starting as user: ' + process.env.USER);

  user = parseInt(process.env.NODEUSERID) || parseInt(process.argv[2]);
  if(!user){
    console.error('no user specified, exiting');
    process.exit();
  }

  //attempt to de-escalate user permissions
  try {
    process.setgid(user);
    process.setuid(user);
  } catch (e) {
    console.error('problem setting user/group, exiting');
    console.dir(e);
    process.exit();
  }
  console.log('user changed to: ' + user);

  port = parseInt(process.env.NODESERVERPORT) || parseInt(process.argv[3]);
  if(!port){
    console.error('no port defined, exiting');
    process.exit();
  }
}