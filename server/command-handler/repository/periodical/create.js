'use strict'

const CreatePeriodicalCommand = require('../../../command/periodical/create')
const PeriodicalModel = require('../../../model/periodical')

module.exports = {
  command: CreatePeriodicalCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {PeriodicalRepository} repository
   * @param {CreatePeriodicalCommand} cmd
   * @return {Promise.<PeriodicalCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let enabledIn = 0
    if (cmd.enabledIn01) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[0]
    }
    if (cmd.enabledIn02) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[1]
    }
    if (cmd.enabledIn03) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[2]
    }
    if (cmd.enabledIn04) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[3]
    }
    if (cmd.enabledIn05) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[4]
    }
    if (cmd.enabledIn06) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[5]
    }
    if (cmd.enabledIn07) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[6]
    }
    if (cmd.enabledIn08) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[7]
    }
    if (cmd.enabledIn09) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[8]
    }
    if (cmd.enabledIn10) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[9]
    }
    if (cmd.enabledIn11) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[10]
    }
    if (cmd.enabledIn12) {
      enabledIn = enabledIn | PeriodicalModel.monthFlags[11]
    }
    let periodical = new PeriodicalModel(
      cmd.checkingAccount.aggregateId(),
      cmd.author.aggregateId(),
      cmd.type,
      cmd.category,
      cmd.title,
      cmd.amount,
      cmd.estimate,
      cmd.startsAt,
      enabledIn
    )
    return repository.add(periodical)
  }
}
