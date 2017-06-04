const repl = require('repl').repl
const { play } = repl.context

const github = require('..')

const chalk = require('chalk')

module.exports = (query) => {
    github.sourceSearch(query)
        .filter(({ items }) => items.length)
        .do(({ user, repo }) => console.log(chalk.grey(`User: ${chalk.white(user)} Repo: ${chalk.yellow(repo)}`)))
        .do(({ items: [ first ]}) => {
            console.log(`Found ${query} on: ${chalk.grey(first.html_url)}`)
        })
        .flatMap(() => ['c', 'e', 'g', 'c5'])
        .subscribe(play)
}
