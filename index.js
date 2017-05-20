'use strict'

const RTM = require("satori-sdk-js")

const endpoint = "wss://open-data.api.satori.com"
const appKey = process.env.SATORI_ACCESS_TOKEN

const github = require('octonode')

const rtm = new RTM(endpoint, appKey)
rtm.on("enter-connected", function() {
    console.log("Connected to RTM!")
})

const client = github.client(process.env.GITHUB_ACCESS_TOKEN)

const foundStars = []

const subscription = rtm.subscribe('gh-watch-events', RTM.SubscriptionMode.SIMPLE, {
    filter: 'select * from `github-events` where type=\'WatchEvent\''
})

subscription.on('rtm/subscription/data', function (pdu) {
    pdu.body.messages
    .map(msg => { return { user: msg.actor.login, repo: msg.repo.name } })
    .filter(({ user, repo }) => {
        if (foundStars.indexOf(user+repo) > -1 ) return false
        foundStars.push(user+repo)
        return true
    })
    .forEach(({ user, repo }) => {
        client.repo(repo).languages((err, langs) => {
            client.search().code({
                q: `mongodb+repo:${repo}`,
                sort: 'created',
                order: 'asc'
            }, (err, { items = [] } = {}) => {
                console.log(user, repo)
                console.log('Languages: ', langs)
                if (items.length) console.log('MongoDB found', items[0].html_url)
                else if (err) console.error(err)
                console.log('----')
            })
        })
    })
})

rtm.start()
