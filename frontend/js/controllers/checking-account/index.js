export default (app) => {
  require('./checking-account')(app)
  require('./spendings')(app)
  require('./spending')(app)
}
