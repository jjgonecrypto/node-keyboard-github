'use strict'

const RTM = require("satori-sdk-js")

const octonode = require('octonode')

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

const github = module.exports = {
    _starred() {
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

    starredRepos() {
        const client = octonode.client(process.env.GITHUB_ACCESS_TOKEN)

        return github._starred()
            .concatMap(({ user, repo }) => {
                const context = client.repo(repo)
                return Rx.Observable.forkJoin(
                    Rx.Observable.of({ user, repo }),
                    Rx.Observable.bindNodeCallback(context.languages.bind(context))()
                )
            })
            .map(([{ user, repo }, [ languages ]]) => {
                const sum = Object.keys(languages).reduce((acc, key) => {
                    return acc + languages[key]
                }, 0)
                languages = Object.keys(languages).reduce((acc, key) => {
                    acc[key] = languages[key] / sum
                    return acc
                }, {})
                return { user, repo, languages }
            })
    },

    sourceSearch(query) {
        const client = octonode.client(process.env.GITHUB_ACCESS_TOKEN)

        return github._starred()
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
            .map(([{ user, repo }, [ { items } ]]) => {
                return { user, repo, items }
            })
    }
}

examples({ path: path.join(__dirname, 'examples'), prefix: 'github_example_', cache: false })
