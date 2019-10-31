# SETUP

## Test Locally

install dependencies:

    $ cd app && npm install

start local blockchain (ganache):

    $ app/node_modules/.bin/ganache-cli --port 7545

start Dapp (webpack):

    $ cd app && npm run dev

migrate smart contracts:

    $ truffle migrate --network ganache

blockchain console:

    $ truffle console --network ganache

use ganache account on metamask:

1. copy Mnemonic phase from terminal displayed when ganache server is booted
2. click recover account with Mnemonic phase
3. insert new password (12345678)
4. choose network ganache local on browser

