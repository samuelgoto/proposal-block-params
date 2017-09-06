var {DocScript} = require('./../docscript.js');
const fs = require('fs');
const Assert = require('assert');

describe.skip("Integration Tests", function(done) {
  fs.readdirSync("./examples")
      .filter(file => {
	// Only keep the .js files
	// console.log(file);
	return file.substr(-3) === ".js";
      })
      .forEach(file => {
	// console.log(file);
	it(`${file}`, function() {
	  let code = fs.readFileSync(`./examples/${file}`);
	  let expected = fs.readFileSync(`./examples/${file}.out`);
	  // let foo = [];
	  // let  = ;
	  // let result = DocScript.compile(code);
	  // console.log(`${docscript} ${result}`);
	  // let b = eval(`${DocScript.api()} ${result}`);
	  let stdout = [];
	  let result = DocScript.eval(`
	      ${code.toString()}
          `, stdout);
	  // console.log(result);
	  // console.log(stdout.join("\n"));
	  // console.log(expected.toString());
	  let succeeded = Assert.equal(
	      `${expected.toString()}`, `${stdout.join("\n")}\n`,
	      `Got: \n${stdout.join("\n")}\n`);
	  // let result = eval(code.toString());
	  // DocScript.eval(DocScript.api(), code.toString());
	});
      });
});
