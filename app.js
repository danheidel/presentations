'use strict';

var user, port;
startup();

var fs = require('fs');
var express = require('express');
var server = express();
var consolidate = require('consolidate');
var handlebars = require('handlebars');

server.engine('html', consolidate.handlebars);
server.set('view engine', 'html');
server.set('views', __dirname + '/views');

parseSlidesDir('slides', function(err, routes){
  if(err){
    console.error('directory parsing error: ' + err);
    process.exit();
  }
  startServer(routes);
});

function startServer(slideRoutes){
  server.get('/', function(req, res){
    res.render('index', {
      routes: slideRoutes
    });
  });
  server.use(express.static(__dirname + '/public'));
  slideRoutes.forEach(function(route){
    console.log(route);
    server.use('/' + route.route, express.static(__dirname + '/slides/' + route.route));
    server.use('/' + route.route, express.static(__dirname + '/public'));
  });

  server.listen(port);
  console.log('server started at: ' + port);
}

function registerPartials(path){

}

function parseSlidesDir(startDir, doneCb){
  var routes = [];
  fs.readdir(startDir, function(err, files){
    if(err){ return doneCb(err);}
    var numFiles = files.length;
    if(!numFiles || numFiles === 0) { return doneCb('empty directory');}
    files.forEach(function(directory){
      fs.stat(startDir + '/' + directory, function(err, stats){
        if(stats && stats.isDirectory()){
          fs.readFile(startDir + '/' + directory + '/info.json', function(err, data){
            if(err){
              return doneCb('info.json config file for ' + directory + ' missing');
            }
            var tempRoute = JSON.parse(data);
            tempRoute.route = directory;
            routes.push(tempRoute);
            numFiles --;
            if(numFiles === 0){
              return doneCb(null, routes);
            }
          });
        } else {
          numFiles --;
          if(numFiles === 0){
            return doneCb(null, routes);
          }
        }
      });
    });
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