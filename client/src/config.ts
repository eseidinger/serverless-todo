// TODO: (done) Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'q4scdpvl3f'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: (done) Create an Auth0 application and copy values from it into this map
  domain: 'dev-eseidinger.eu.auth0.com',            // Auth0 domain
  clientId: 'ai1gmrVyuky7Cd3ldCOxDcP5tUOScq0w',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
