import config from './config'

export default {
  app: config.get('app'),
  environment: config.get('environment'),
  version: config.get('version'),
  appName: 'Ausgaben',
  description: 'Ausgaben – Your personal spendings tracker',
  apiIndex: `${config.get('api_host')}/api`,
  apiHost: config.get('api_host'),
  webHost: config.get('web_host'),
  baseHref: '/',
  mimeType: 'application/vnd.ausgaben.v1+json'
}
