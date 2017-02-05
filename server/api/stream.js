import {AccessDeniedError} from '@resourcefulhumans/rheactor-errors'
import Promise from 'bluebird'
import {ModelEvent} from 'rheactor-event-store'

/**
 * @param {express.app} app
 * @param {BackendEmitter} emitter
 * @param {function} verifyToken
 * @param {CheckingAccountRepository} checkingAccountRepo
 * @param {CheckingAccountUserRepository} checkingAccountUserRepo
 * @param {SpendingRepository} spendingRepo
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
export default (app, emitter, verifyToken, checkingAccountRepo, checkingAccountUserRepo, spendingRepo, jsonld, sendHttpProblem, transformer) => {
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
              throw new AccessDeniedError(req.url, 'Not your checking account!')
            }
          })
      })
      .then(() => {
        req.socket.setTimeout(1000 * 60 * 60 * 24)

        let messageCount = 0

        /**
         * @param {ModelEvent} event
         */
        let sendEvent = (event) => {
          messageCount++
          res.write('event: ModelEvent\n')
          res.write(`id: ${messageCount}\n`)
          res.write(`data: ${JSON.stringify(event)}\n\n`)
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
            switch (event.name) {
              case 'SpendingCreatedEvent':
                spendingRepo.getById(event.aggregateId)
                  .then(spending => {
                    if (spending.checkingAccount === checkingAccountId) {
                      event.entity = transformer(spending)
                      sendEvent(event)
                    }
                  })
                break
              default:
                sendEvent(event)
            }
          }

        emitter.on('*', handler)

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        })
        res.write('\n')
        sendEvent(new ModelEvent(userId, 'PingEvent', {init: true}))

        let ping = () => {
          sendEvent(new ModelEvent(userId, 'PingEvent', {}))
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
