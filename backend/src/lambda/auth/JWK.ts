export interface JWK {
    alg: string;
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: Array<string>;
}

export interface JWKS {
    keys: Array<JWK>;
}

export interface SigningKey {
    kid: string;
    publicKey: string;
}

function certToPEM(cert: string) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}

export function getSigningKeys(keys: Array<JWK>): Array<SigningKey> {
    return keys
        .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
            && key.kty === 'RSA' // We are only supporting RSA
            && key.kid // The `kid` must be present to be useful for later
            && key.x5c && key.x5c.length // Has useful public keys (we aren't using n or e)
        ).map(key => {
            return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) };
        });
}
