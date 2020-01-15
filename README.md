This repository relates to the research paper "Anonymous Voting on Ethereum through Zero Knowledge Proof of Membership".
Link to the paper:

https://www.overleaf.com/read/dbfrggrzdykm

The code related to the zero knowledge proof of membership can be found under [zk-proof/tokenPool.zok](https://github.com/alvaro-alonso/Ethereum-Anonymous-Voting/blob/master/zk-proof/tokenPool.zok)

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

# Generate New zk-proof

1. start zokrates container:

    $ docker run -ti zokrates/zokrates /bin/bash

2. copy .zok file necessary for proof:

    $ docker cp <FILE_PATH> <CONTAINER_ID>:./home/zokrates/<FILE_NAME>
    
3. compile proof with secure backend:

    $ ./zokrates compile -i tokenPool.zok
    $ ./zokrates setup --proving-scheme gm17
    $ ./zokrates compute-witness -a <WITNESS_STRING>
    $ ./zokrates export-verifier --proving-scheme gm17
    $ ./zokrates generate-proof --proving-scheme gm17
