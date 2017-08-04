#!/usr/bin/env node

var program = require('commander');
var {DocScript} = require('./docscript.js');
var fs = require('fs');

program
  .arguments('<file>')
  // .option('-u, --username <username>', 'The user to authenticate as')
  // .option('-p, --password <password>', 'The user\'s password')
  .action(function(file) {
    // console.log('user: %s pass: %s file: %s',
    //   program.username, program.password, file);
    // console.log(`${file}`);
    // DocScript.compile();

    fs.readFile(file, 'utf8', function(err, data) {
      if (err) {
        return console.log(err);
      }
      console.log(DocScript.compile(data));
    });
  })
  .parse(process.argv);
