import CreatePeriodicalCommand from '../../../command/periodical/create'
import {PeriodicalModel} from '../../../model/periodical'

export default {
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
    return repository.add({
      checkingAccount: cmd.checkingAccount.meta.id,
      author: cmd.author.meta.id,
      category: cmd.category,
      title: cmd.title,
      amount: cmd.amount,
      estimate: cmd.estimate,
      startsAt: cmd.startsAt,
      enabledIn,
      saving: cmd.saving
    })
  }
}
