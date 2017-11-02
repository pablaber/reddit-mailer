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

#### File Structure

The structure of the `config.json` file is as follows:
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

#### Options

Below are the options for the `config.json` file. The only required option is `email`, which must be a valid email address. Everything else is optional. If a subreddit is specified, the `name` attribute is required, and all other attributes are optional.

| Key | Default Value | Description |
| --- | --- | --- |
| `email` | **Required** | the email you would like the articles to be sent to, this option must be specified as a valid email
| `blockedDomains`| `[]` | a list of domain names you would like to be ignored during the scrape |
| `subreddits` | `[{name: "all"}]` | a list of subreddits that you would like to include in the scrape |
| `subreddits[n].name` | **Required** | the name of the subreddit, required if specifying custom subreddits |
| `subreddits[n].limit` | `10` | the number of posts in the subreddit to be scraped |
| `subreddits[n].video` | `true` | whether or not to include video links |
| `subreddits[n].selfPosts` | `true` | whether or not to include self post links |
