#!/bin/sh
set -e

node package-deploy/npm-login.js $(cat "/etc/npm-cred/NPM_AUTH_TOKEN")
cd builder
npm whoami
npm i
npm run build
echo "$1"
echo "worked till npm pack"
filename="$(npm pack --dry-run | tail -n 1)"
echo "fetched filename successfully"
echo "$filename"
npm whoami
echo "starting to publish package"
if [[ "$1" == "qa" ]] || [[ "$1" == "master" ]] || [[ "$1" == "staging" ]] || [[ "$1" == "staging-app2" ]]
then
  npm publish
  echo "publishing main package"
else
  npm publish --tag beta
  echo "publishing beta package"
fi

echo "$filename package pushed to NPM successfully"