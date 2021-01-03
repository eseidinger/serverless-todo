import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: (done) Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUri = 'https://dev-eseidinger.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

interface JWK {
  alg: string,
  kty: string,
  use: string,
  n: string,
  e: string,
  kid: string,
  x5t: string,
  x5c: Array<string>
}
interface JWKS {
  keys: Array<JWK>
}

interface SigningKey {
  kid: string,
  publicKey: string
}

function certToPEM(cert: string) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

function getSigningKeys(keys: Array<JWK>): Array<SigningKey> {
  return keys
    .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
                && key.kty === 'RSA' // We are only supporting RSA
                && key.kid           // The `kid` must be present to be useful for later
                && key.x5c && key.x5c.length // Has useful public keys (we aren't using n or e)
    ).map(key => {
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) };
    });
};

async function getKey(): Promise<string> {
  const response = await Axios.get<JWKS>(jwksUri)

  if (response.status !== 200) {
    throw new Error('retrieving JWKS failed')
  }

  const keys = response.data.keys;
  if (!keys || !keys.length) {
    throw new Error('no keys received')
  }

  const signingKeys = getSigningKeys(keys)
  if (!signingKeys || !signingKeys.length) {
    throw new Error('no signing keys received')
  }

  return signingKeys[0].publicKey
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: (done) Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const key = await getKey()

  return verify(token, key, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
