#!/bin/sh
set -e

node package-deploy/npm-login.js $(cat "/etc/npm-cred/NPM_AUTH_TOKEN")
npm whoami
cd builder
npm i
npm run build
npm pack
echo "$1"
echo "worked till npm pack"
filename="$(npm pack --dry-run | tail -n 1)"
echo "fetched filename successfully"
echo "$filename"
cd ..
npm whoami
echo "starting to publish package"
if [[ "$1" == "qa" ]] || [[ "$1" == "master" ]] || [[ "$1" == "staging" ]] || [[ "$1" == "staging-app2" ]]
then
  npm publish builder/$filename --registry=https://registry.npmjs.org/
  echo "publishing main package"
else
  npm publish --tag beta builder/$filename --registry=https://registry.npmjs.org/
  echo "publishing beta package"
fi

echo "$filename package pushed to NPM successfully"