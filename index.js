'use strict'

const RTM = require("satori-sdk-js")

const octonode = require('octonode')
const chalk = require('chalk')
const util = require('util')
const path = require('path')
const examples = require('node-examples')
const Rx = require('node-keyboard-rx')()

function subscribeToGithubStars() {
    const endpoint = "wss://open-data.api.satori.com"
    const appKey = process.env.SATORI_ACCESS_TOKEN

    const rtm = new RTM(endpoint, appKey)

    const subscription = rtm.subscribe('gh-watch-events', RTM.SubscriptionMode.SIMPLE, {
        filter: 'select * from `github-events` where type=\'WatchEvent\''
    })

    rtm.start()

    return Rx.Observable.fromEvent(subscription, 'rtm/subscription/data').finally(() => rtm.stop())
}


// subscription.on('rtm/subscription/data', function (pdu) {
//     pdu.body.messages
//     .map(msg => { return { user: msg.actor.login, repo: msg.repo.name } })
//     .filter(({ user, repo }) => {
//         if (foundStars.indexOf(user+repo) > -1 ) return false
//         foundStars.push(user+repo)
//         return true
//     })
//     .forEach(({ user, repo }) => {
//         client.repo(repo).languages((err, langs) => {
//             client.search().code({
//                 q: `mongodb+repo:${repo}`,
//                 sort: 'created',
//                 order: 'asc'
//             }, (err, { items = [] } = {}) => {
//                 console.log(user, repo)
//                 console.log('Languages: ', langs)
//                 if (items.length) console.log('MongoDB found', items[0].html_url)
//                 else if (err) console.error(err)
//                 console.log('----')
//             })
//         })
//     })
// })



const github = module.exports = {
    starred() {
        const starred = subscribeToGithubStars()
        const foundStars = []

        return starred
            .flatMap(pdu => pdu.body.messages)
            .map(msg => { return { user: msg.actor.login, repo: msg.repo.name } })
            .filter(({ user, repo }) => {
                if (foundStars.indexOf(user+repo) > -1 ) return false
                foundStars.push(user+repo)
                return true
            })
    },

    languageStarred(language = 'JavaScript') {
        const client = octonode.client(process.env.GITHUB_ACCESS_TOKEN)

        return github.starred()
            .concatMap(({ user, repo }) => {
                const context = client.repo(repo)
                return Rx.Observable.forkJoin(
                    Rx.Observable.of({ user, repo }),
                    Rx.Observable.bindNodeCallback(context.languages.bind(context))()
                )
            })
            .map(([{ user, repo }, [ languages ]]) => { return { user, repo, languages } })
            .do(({ user, repo }) => console.log(chalk.grey(`User: ${chalk.white(user)} Repo: ${chalk.yellow(repo)}`)))
            // .do(console.log)
            .do(({ languages }) => console.log(chalk.grey(util.inspect(languages))))
    },

    sourceSearch(query) {
        const client = octonode.client(process.env.GITHUB_ACCESS_TOKEN)

        return github.starred()
            .concatMap(({ user, repo }) => {
                const context = client.search()
                return Rx.Observable.forkJoin(
                    Rx.Observable.of({ user, repo }),
                    Rx.Observable.bindNodeCallback(context.code.bind(context))({
                        q: `${query}+repo:${repo}`,
                        sort: 'created',
                        order: 'asc'
                    })
                )
            })
            .do(console.log)
    }
}

examples({ path: path.join(__dirname, 'examples'), prefix: 'github_example_' })
