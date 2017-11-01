var request = require('request');
var fs = require('fs');


function loadConfig() {
    var contents = fs.readFileSync("config.json");
    var jsonContent = JSON.parse(contents);
    return jsonContent;
}

console.log(loadConfig());
console.log('hello');

request("https://www.reddit.com/r/webdev/top/.json?limit=2", function(error, response) {
    console.log(response.body);
});
