# node-keyboard-github

[![npm version](https://badge.fury.io/js/node-keyboard-github.svg)](https://badge.fury.io/js/node-keyboard-github)

GitHub search plugin for node-keyboard

![](https://github.com/Giphy/GiphyAPI/raw/master/api_giphy_header.gif)

## Installation

### As Global
If you installed node-keyboard globally, then install this plugin via `npm i -g node-keyboard-github`

Then start node keyboard via `node-keyboard`, and import this plugin via `const github = requireg('node-keyboard-github')`

### As Local
If instead you cloned node-keyboard, then install locally in that folder via `npm i node-keyboard-github`

Then start node keyboard via `node keyboard` and import this plugin via `const github = require('node-keyboard-github')`

## Configuration

The following environment variables need to be added:

* `SATORI_ACCESS_TOKEN` see [https://developer.satori.com](https://developer.satori.com)
* `GITHUB_ACCESS_TOKEN` see [GitHub docs](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/#creating-a-token)

## API

* `starredRepos()` returns a subscription with `{ user, repository, languages }` for every public star action on GitHub
* `sourceSearch(query: String)` returns a subscription with `{ user, repository, items }` for every public star action on GitHub for a repository containing the given `query`

## Examples

* [starred repositories by language](./examples/01_starredlangs.js)
* [search content from starred repositories](./examples/02_starredcontent.js)
