This repository relates to the research paper "Anonymous Voting on Ethereum through Zero Knowledge Proof of Membership".
Link to the paper:

https://www.overleaf.com/read/dbfrggrzdykm

The code related to the zero knowledge proof of membership can be found under [zk-proof/tokenPool.zok](https://github.com/alvaro-alonso/Ethereum-Anonymous-Voting/blob/master/zk-proof/tokenPool.zok)

# SETUP

## start Dapp:
The contracts of the Dapp are deployed in the Ropsten network. To start the App run:

    $ cd app
    $ npm start

Go to http://localhost:3000/ and log in with metamask on the browser. Make sure the Ropsten network is set in metamask

## Test Locally

install dependencies:

    $ cd app && npm install

start local blockchain (ganache):

    $ app/node_modules/.bin/ganache-cli --port 7545

migrate smart contracts:

    $ truffle migrate --network ganache --contracts_build_directory="./app/src/build/contracts"

blockchain console:

    $ truffle console --network ganache

use ganache account on metamask:


# Generate New zk-proof

start zokrates container:

    $ docker run -ti zokrates/zokrates /bin/bash

on a new window check container id with:

	$ docker container ls

copy .zok file necessary for proof:

    $ docker cp tokePool.zok <CONTAINER_ID>:./home/zokrates/tokenPool.zok
    
compile proof with secure backend:

    $ ./zokrates compile -i tokenPool.zok
    
    $ ./zokrates setup --proving-scheme gm17
    
    $ ./zokrates compute-witness -a <WITNESS_STRING>
    
    $ ./zokrates export-verifier --proving-scheme gm17
    
    $ ./zokrates generate-proof --proving-scheme gm17

export proof and contract from container:

	$ docker cp <CONTAINER_ID>:./home/zokrates/proof.json ./zk-proof/valid_proof.json

	$ docker cp <CONTAINER_ID>:./home/zokrates/verifier.sol ./contracts/verifier.sol
