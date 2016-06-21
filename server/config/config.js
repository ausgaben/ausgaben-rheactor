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
  'mime_type': 'application/vnd.resourceful-humans.carhds.v1+json',
  'port': port,
  'host': host,
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
    'from': 'info@carhds.de',
    'name': 'caRHds by Resourceful Humans',
    'smtp_config': 'carhds',
    'password_change_template': 'carhds-password-change',
    'email_verification_template': 'carhds-email-verification',
    'invite_to_meeting_template': 'carhds-invite-to-meeting',
    'template_prefix': 'carhds-'
  },
  'force_mails': false,
  'disable_mails': false,
  'aws': {
    'region': 'eu-central-1',
    'access_key_id': 'secret',
    'secret_access_key': 'secret',
    'avatar_bucket': 'carhds-avatars',
    'website_bucket': 'carhds.me'
  },
  'slack': {
    'webhook': false
  },
  'uploads_location': '/tmp'
})

module.exports = nconf
