#!/usr/bin/env sh

npx ts-node node_modules/.bin/tslint --project ./auto-ts/graph-editor --config ./config/lints/es5-class.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/graph-editor --config ./config/lints/es5-super-call.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/graph-editor --config ./config/lints/es5-member.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/graph-editor --config ./config/lints/final.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/mxGraph --config ./config/lints/es5-class.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/mxGraph --config ./config/lints/es5-super-call.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/mxGraph --config ./config/lints/es5-member.json --fix
npx ts-node node_modules/.bin/tslint --project ./auto-ts/mxGraph --config ./config/lints/final.json --fix
