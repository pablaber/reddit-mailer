var request = require('request');

request("https://www.reddit.com/r/webdev/top/.json?limit=2", function(error, response) {
    console.log(response.body);
});
