// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/pkce-challenge/dist/index.node.js
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/pkce-challenge/dist/index.node.js
init_define_OPENCODE_BUILD_INFO();

var crypto2;

crypto2 = globalThis.crypto?.webcrypto ?? // Node.js [18-16] REPL
globalThis.crypto ?? // Node.js >18
import("node:crypto").then((m) => m.webcrypto);

async function getRandomValues(size) {
  return (await crypto2).getRandomValues(new Uint8Array(size));
}

async function random(size) {
  const mask = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const evenDistCutoff = Math.pow(2, 8) - Math.pow(2, 8) % mask.length;
  let result = "";
  while (result.length < size) {
    const randomBytes9 = await getRandomValues(size - result.length);
    for (const randomByte of randomBytes9) {
      if (randomByte < evenDistCutoff) {
        result += mask[randomByte % mask.length];
      }
    }
  }
  return result;
}

async function generateVerifier(length) {
  return await random(length);
}

async function generateChallenge(code_verifier) {
  const buffer = await (await crypto2).subtle.digest("SHA-256", new TextEncoder().encode(code_verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
}

async function pkceChallenge(length) {
  if (!length)
    length = 43;
  if (length < 43 || length > 128) {
    throw `Expected a length between 43 and 128. Received ${length}.`;
  }
  const verifier = await generateVerifier(length);
  const challenge = await generateChallenge(verifier);
  return {
    code_verifier: verifier,
    code_challenge: challenge
  };
}
export { getRandomValues, random, generateVerifier, generateChallenge, pkceChallenge, crypto2 };
