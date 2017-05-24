// const repl = require('repl').repl
// const { play } = repl.context

const github = require('..')

module.exports = () => {

    github.languageStarred('JavaScript').subscribe()
}
