'use strict'

const Errors = require('rheactor-value-objects/errors')
const Promise = require('bluebird')

/**
 * @param {express.app} app
 * @param {BackendEmitter} emitter
 * @param {function} verifyToken
 * @param {CheckingAccountRepository} checkingAccountRepo
 * @param {CheckingAccountUserRepository} checkingAccountUserRepo
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 */
module.exports = (app, emitter, verifyToken, checkingAccountRepo, checkingAccountUserRepo, jsonld, sendHttpProblem) => {
  app.get('/api/checking-account/:id/stream', (req, res) => {
    let checkingAccountId = req.params.id
    let userId
    Promise
      .join(
        verifyToken(req.query.token),
        checkingAccountRepo.getById(checkingAccountId)
      )
      .spread((token, account) => {
        userId = token.payload.sub_id
        return checkingAccountUserRepo.findByCheckingAccountId(checkingAccountId).filter(checkingAccountUser => checkingAccountUser.user === userId)
          .spread((checkingAccountUser) => {
            if (!checkingAccountUser) {
              throw new Errors.AccessDeniedError(req.url, 'Not your checking account!')
            }
          })
      })
      .then(() => {
        req.socket.setTimeout(1000 * 60 * 60 * 24)

        let messageCount = 0

        let sendMessage = (eventName, eventCreatedAt, payload) => {
          messageCount++
          payload = payload || {}
          res.write('event: checkingAccountStream\n')
          res.write('id: ' + messageCount + '\n')
          res.write('data: ' + JSON.stringify({event: eventName, eventCreatedAt: eventCreatedAt, payload}) + '\n\n')
        }

        /**
         * @param {ModelEvent} event
         * @param {Object} payload
         */
        let sendEvent = (event) => {
          sendMessage(event.constructor.name, event.createdAt || Date.now(), event.data)
        }

        let handler =
          /**
           * @param {ModelEvent} event
           */
          event => {
            if (!(/Event$/.test(event.constructor.name))) {
              // Only sent events
              return
            }
            sendEvent(event)
          }

        emitter.on('*', handler)

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        })
        res.write('\n')
        sendMessage('Hello', Date.now(), {'nice to meet': userId})

        let ping = () => {
          sendMessage('Ping', Date.now())
        }
        setInterval(ping, 1000 * 15)

        req.on('close', () => {
          emitter.removeListener('*', handler)
          clearInterval(ping)
        })
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
