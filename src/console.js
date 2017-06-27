import program from 'commander'
import Promise from 'bluebird'
import glob from 'glob'
const globAsync = Promise.promisify(glob)
import path from 'path'
import colors from 'colors'
import _map from 'lodash/map'
import _concat from 'lodash/concat'
import backend from './backend'
const config = backend.config

program
  .version(config.get('version'))

let resolveTimeout
const emitterActive = new Promise((resolve, reject) => {
  resolveTimeout = resolve
})

let backendEmitterTimout
backend.emitter.on('*', () => {
  clearTimeout(backendEmitterTimout)
  backendEmitterTimout = setTimeout(() => {
    resolveTimeout()
  }, 1000)
})
backendEmitterTimout = setTimeout(() => {
  resolveTimeout()
}, 1000)

const runCommand = function (cmd) {
  cmd.action.apply(null, _concat(backend, [].slice.call(arguments, 1)))
    .then(() => {
      emitterActive
        .then(() => {
          process.exit(0)
        })
    })
    .catch((err) => {
      console.error('Console error', err)
      process.exit(1)
    })
}

function makeRed (txt) {
  return colors.red(txt)
}

const configureCommand = (cmdFile) => {
  let cmdName = path.basename(cmdFile, '.js')
  let cmd = require(cmdFile)
  let c = program
    .command([cmdName, cmd.arguments].join(' '))
    .description(cmd.description)
    .action(runCommand.bind(null, cmd))
  if (cmd.options) {
    _map(cmd.options, (option) => {
      c.option(...option)
    })
  }
  return cmdName
}

Promise.join(
  globAsync(path.join(__dirname, '/console-command/*.js')).map(configureCommand),
  globAsync(path.join(__dirname, '/../node_modules/rheactor-server/console-command/*.js')).map(configureCommand)
)
  .spread((networhkCommands, rheactorCommands) => {
    let commands = _concat(networhkCommands, rheactorCommands)
    if (!process.argv.slice(2).length || commands.indexOf(process.argv.slice(2)[0]) < 0) {
      makeRed(backend.appName)
      program.outputHelp(makeRed)
      process.exit(1)
    } else {
      program.parse(process.argv)
    }
  })
