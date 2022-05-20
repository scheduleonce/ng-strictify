#!/bin/sh
set -e

cd builder
node ../package-deploy/npm-login.js $(cat "/etc/npm-cred/NPM_AUTH_TOKEN")
npm whoami

npm i

npm run build

npm pack

filename="$(npm pack --dry-run | tail -n 1)"
echo "$filename"
echo "$1"
npm whoami

if [[ "$1" == "qa" ]] || [[ "$1" == "master" ]] || [[ "$1" == "staging" ]] || [[ "$1" == "staging-app2" ]]
then
  npm publish $filename --registry=https://registry.npmjs.org/
else
  npm publish --tag beta $filename --registry=https://registry.npmjs.org/
fi

echo "$filename package pushed to NPM successfully"