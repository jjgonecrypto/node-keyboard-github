const repl = require('repl').repl
const { play } = repl.context

const github = require('..')

const chalk = require('chalk')
const util = require('util')

module.exports = () => {
    const sub = github.starredRepos()
        .do(({ user, repo }) => console.log(chalk.grey(`User: ${chalk.white(user)} Repo: ${chalk.yellow(repo)}`)))
        .do(({ languages }) => console.log(chalk.grey(util.inspect(languages))))
        .share() // use HOT observable to prevent multiple requests per subscription

    sub
        .filter(({ languages }) => 'JavaScript' in languages)
        .flatMap(() => ['a2','e4'])
        .subscribe(play)

    sub
        .filter(({ languages }) => 'CoffeeScript' in languages)
        .flatMap(() => ['c5'])
        .subscribe(play)

    sub
        .filter(({ languages }) => 'TypeScript' in languages)
        .flatMap(() => ['c#5'])
        .subscribe(play)

    sub
        .filter(({ languages }) => 'Rust' in languages)
        .flatMap(() => ['f2', 'a4', 'c3'])
        .subscribe(play)

    sub
        .filter(({ languages }) => 'Go' in languages)
        .flatMap(() => ['g2', 'b', 'd', 'f5'])
        .subscribe(play)
}
