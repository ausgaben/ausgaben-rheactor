import program from 'commander'
import Promise from 'bluebird'
import colors from 'colors'
import _map from 'lodash/map'
import _concat from 'lodash/concat'
import {kebabCase} from 'lodash'
import backend from './backend'
import {rheactorjsConsoleCommands} from '@rheactorjs/server'
import {ausgabenConsoleCommands} from './console-command/ausgaben-console-commands'
let config = backend.config

program
  .version(config.get('version'))

let resolveTimeout
let emitterActive = new Promise((resolve, reject) => {
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
}, 2000)

let runCommand = function (cmd) {
  cmd.action.apply(null, _concat(backend, [].slice.call(arguments, 1)))
    .then(() => {
      emitterActive
        .then(() => {
          process.exit(0)
        })
    })
    .catch((err) => {
      console.error(makeRed(err.message))
      process.exit(1)
    })
}

function makeRed (txt) {
  return colors.red(txt)
}

let configureCommand = (cmd) => {
  const cmdName = kebabCase(cmd.name)
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
  rheactorjsConsoleCommands.map(configureCommand),
  ausgabenConsoleCommands.map(configureCommand)
)
  .spread((rheactorjsCommands, ausgabenCommands) => {
    let commands = _concat(rheactorjsCommands, ausgabenCommands)
    if (!process.argv.slice(2).length || !commands.includes(process.argv.slice(2)[0])) {
      makeRed(backend.appName)
      program.outputHelp(makeRed)
      process.exit(1)
    } else {
      program.parse(process.argv)
    }
  })
