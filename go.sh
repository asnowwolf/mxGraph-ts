#!/usr/bin/env sh

npx ts-node node_modules/.bin/tslint --project ./auto-ts --config ./config/lints/es5-class.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts --config ./config/lints/es5-super-call.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts --config ./config/lints/final.json --fix
