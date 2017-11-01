# Reddit Mailer

A node.js app that scrapes reddit for the top articles, and emails you the results.

### Usage
Fork the project and download locally. 

Install dependencies.
```
npm install
```

Copy `config.json.default` to create your own config file.
```
cp config.json.default config.json
```

View config options section to see more about what each option does. Once your `config.json` file is setup, you can run the program to get an email of the top articles of your specification.
```
node send
```

### Config Options
The structure of the config file is as follows:
```
{
    "email": "example@email.com",
    "blockedDomains": [
        "youtube.com",
        "imgur.com"
    ],
    "subreddits": [
        {
            "name": "webdev",
            "limit": 10
        },
        {
            "name": "technology",
            "limit": 15
        }
    ]
}
```
- `email` - the email you would like the articles to be sent to
- `blockedDomains` - a list of domain names you would like to be ignored for your email
- `subreddits` - a list of subreddits that you would like to be scraped and sent
    - `name` - the name of the subreddit
    - `limit` - the number of posts you would like to be viewed
