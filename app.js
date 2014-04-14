'use strict';

var user, port;
startup();

var express = require('express');

var server = express(); // better instead
server.use('/media', express.static(__dirname + '/media'));
server.use(express.static(__dirname + '/public'));

server.listen(port);
console.log('server started at: ' + port);

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