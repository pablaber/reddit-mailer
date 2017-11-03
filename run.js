var request = require('request');
var fs = require('fs');
var moment = require('moment');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var path = require('path');

var Tag = require('./modules/htmlBuilder');

require('dotenv').config({path: path.join(__dirname, ".env")});

run();

function run() {
    var configJson = loadConfig();
    createPostObjects(configJson).then(function(postObjectArray) {
        var html = generateHTML(postObjectArray, configJson);
        emailHTML(html, configJson);
    });
}

function loadConfig() {
    var contents = fs.readFileSync(path.join(__dirname, "config.json"));
    var user = JSON.parse(contents);
    var configObj = {};
    // email
    if (!!user.email && validateEmail(user.email)) {
        configObj.email = user.email;
    }
    else {
        throw new Error("Config object must have a valid email filed!")
    }
    // blocked domains
    if (!!user.blockedDomains) {
        configObj.blockedDomains = user.blockedDomains;
    }
    else {
        configObj.blockedDomains = [];
    }
    // subreddits
    if (!!user.subreddits) {
        var configSubreddits = [];
        for (var subreddit of user.subreddits) {
            // name
            var configSubreddit = {};
            if (!!subreddit.name) {
                configSubreddit.name = subreddit.name;
            }
            else {
                throw new Error("Subreddits must have a valid name field.");
            }
            // limit
            if (!!subreddit.limit) {
                configSubreddit.limit = subreddit.limit;
            }
            else {
                configSubreddit.limit = 10;
            }
            // videos
            if (subreddit.videos != undefined) {
                configSubreddit.videos = subreddit.videos;
            }
            else {
                configSubreddit.videos = true;
            }
            // self posts
            if (subreddit.selfPosts != undefined) {
                configSubreddit.selfPosts = subreddit.selfPosts;
            }
            else {
                configSubreddit.selfPosts = true;
            }
            configSubreddits.push(configSubreddit);

        }
        configObj.subreddits = configSubreddits;
    }
    else {
        configObj.subreddits = [{
            name: "all",
            limit: 10,
            videos: true,
            selfPosts: true
        }];
    }
    return configObj;
}

function createPostObjects(configJson) {
    return new Promise(function(resolve, reject) {
        var subredditPosts = new Array(configJson.subreddits.length).fill(null);
        subredditPosts = subredditPosts.map(function() { 
            return [];
        });
        var finished = 0;
        for (let i in configJson.subreddits) {
            var subreddit = configJson.subreddits[i];
            var url = apiUrl(subreddit.name, subreddit.limit);
            request(url, function (error, response) {
                if(error) {
                    reject(error);
                }
                var json = JSON.parse(response.body);
                var posts = json.data.children;
                for (let post of posts) {
                    var postObj = {
                        title: post.data.title,
                        url: post.data.url,
                        author: post.data.author,
                        subreddit: post.data.subreddit,
                        domain: post.data.domain,
                        created: post.data.created_utc,
                        score: post.data.score,
                        is_self: post.data.is_self,
                        selftext: post.data.selftext

                    };
                    subredditPosts[i].push(postObj);
                }
                finished++;
                if(finished === configJson.subreddits.length) {
                    resolve(subredditPosts);
                }
            });
        }
    });
}

function generateHTML(postArray, configJson) {
    var container = new Tag("div").style({
        margin: "20px"
    });
    for(var i in postArray) {
        var subreddit = postArray[i];
        var subredditContainer = new Tag("div");
        var subredditName = configJson.subreddits[i].name;
        var h2SubredditName = new Tag("h2", "Top posts from /r/" + subredditName).style({
            "font-size": "24px",
            "font-weight": "900"
        });
        subredditContainer.addChild(h2SubredditName);

        var postList = new Tag("ol").style({
            "list-style-type": "decimal",
            "font-size": "20px",
            "border-top": "2px solid black"
        });
        var postNumber = 0;
        for(var j in subreddit) {
            var post = subreddit[j];
            var liPost = new Tag("li");
            if(postNumber++ !== 0) {
                liPost.style({
                    "border-top": "1px solid darkgrey"
                });
            }
            var divPost = new Tag("div");
            liPost.addChild(divPost);

            var titleDomain = new Tag("div");
            var title = new Tag("a", post.title).attr({
                href: post.url
            });
            var domain = new Tag("span", "(" + post.domain + ")").style({
                "color": "grey",
                "font-size": "16px",
                "margin-left": "5px"
            });
            titleDomain.addChild(title).addChild(domain);
            divPost.addChild(titleDomain);

            var username = new Tag("span", post.author).style({
                color: "dodgerblue"
            });
            var postInfo = new Tag("div", "Posted by " + username.html()).style({
                "font-size": "16px"
            });          
            divPost.addChild(postInfo);

            var score = new Tag("div", "Score: " + post.score).style({
                "font-size": "16px"
            });
            divPost.addChild(score);

            if(post.is_self) {
                var selfText = new Tag("div", post.selftext).style({
                    "font-size": "16px",
                    "border": "1px solid lightgrey",
                    "border-radius": "1px",
                    "background-color": "ghostwhite",
                    "margin-bottom": "5px"
                });
                divPost.addChild(selfText);
            }

            postList.addChild(liPost);
        }

        subredditContainer.addChild(postList);

        container.addChild(subredditContainer);
    }

    return container.html();
}

function emailHTML(html, configJson) {
    var email = process.env.EMAIL;
    var password = process.env.PASSWORD;

    var transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL,
        to: configJson.email,
        subject: 'Reddit Mailer Scrape',
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            console.log('-----------------------------');
            console.log('From: ' + mailOptions.from);
            console.log('To: ' + mailOptions.to);
            console.log('Subject: ' + mailOptions.subject);
        }
    });
}

// from https://stackoverflow.com/questions/46155/how-to-validate-email-address-in-javascript
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function apiUrl(subreddit, limit) {
    var url = "https://www.reddit.com/r/";
    url += subreddit;
    url += "/top/.json?limit=";
    url += limit;
    return url;
}
