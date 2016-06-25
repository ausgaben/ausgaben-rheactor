'use strict'

const nconf = require('nconf')
const path = require('path')
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
      'aws__access_key_id',
      'aws__secret_access_key',
      'aws__avatar_bucket',
      'aws__website_bucket',
      'redis__host',
      'redis__port',
      'redis__database',
      'host',
      'port',
      'api_host',
      'web_host',
      'force_mails',
      'disable_mails',
      'slack__webhook'
    ],
    lowerCase: true,
    separator: '__'
  })

const host = nconf.get('host') || 'localhost'
const port = nconf.get('port') || 8080

// Set defaults
nconf.defaults({
  'environment': 'development',
  'mime_type': 'application/vnd.ausgaben.v1+json',
  port,
  host,
  'api_host': 'http://' + host + ':' + port,
  'web_host': 'http://' + host + ':' + port,
  'deployVersion': +new Date(),
  'version': pjson.version,
  'app': pjson.name,
  'appName': pjson.appName,
  'description': pjson.description,
  'root': path.normalize(path.join(__dirname, '/../..')),
  'token_lifetime': 60 * 60 * 24 * 30, // 30 days
  'redis': {
    'host': '127.0.0.1',
    'port': 6379,
    'database': 1
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
  'aws': {
    'region': 'eu-central-1',
    'access_key_id': 'secret',
    'secret_access_key': 'secret',
    'avatar_bucket': 'ausgaben-avatars',
    'website_bucket': 'ausgaben.me'
  },
  'slack': {
    'webhook': false
  },
  'uploads_location': '/tmp'
})

module.exports = nconf
