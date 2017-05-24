const repl = require('repl').repl
const { play } = repl.context

const github = require('..')

module.exports = () => {

    github.languageStarred()
    // twitter.search({
    //     track: 'bieber',
    //     minFollowers: 100
    // }).do(twitter.log.sentiment).flatMap(twitter.map.toMusic).subscribe(play)
}
