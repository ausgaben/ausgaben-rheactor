'use strict'

const nconf = require('nconf')
const pjson = require('../../package.json')

nconf.use('memory')

nconf
// Allow overwrites from env
  .env({
    whitelist: [
      'environment',
      'template_mailer__endpoint',
      'template_mailer__api_key',
      'template_mailer__credentials',
      'redis__host',
      'redis__port',
      'redis__database',
      'redis__password',
      'host',
      'port',
      'api_host',
      'web_host',
      'force_mails',
      'disable_mails',
      'slack__webhook',
      'rsync'
    ],
    lowerCase: true,
    separator: '__'
  })

const host = nconf.get('host') || 'localhost'
const port = nconf.get('port') || 8080

// Set defaults
nconf.defaults({
  'app': pjson.name,
  'version': pjson.version,
  'environment': 'development',
  port,
  host,
  'api_host': 'http://' + host + ':' + port,
  'web_host': 'http://' + host + ':' + port,
  'token_lifetime': 60 * 60 * 24 * 30, // 30 days
  'redis': {
    'host': '127.0.0.1',
    'port': 6379,
    'database': 1,
    'password': null
  },
  'private_key': null,
  'public_key': null,
  'bcrypt_rounds': 14,
  'template_mailer': {
    'credentials': null,
    'endpoint': null,
    'api_key': null,
    'from': 'team@ausgaben.me',
    'name': 'Ausgaben',
    'smtp_config': 'ausgaben',
    'password_change_template': 'password-change',
    'email_verification_template': 'email-verification',
    'template_prefix': 'ausgaben-'
  },
  'force_mails': false,
  'disable_mails': false,
  'rsync': 'user@server:path',
  'slack': {
    'webhook': false
  },
  'uploads_location': '/tmp'
})

module.exports = nconf
