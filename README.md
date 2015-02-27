# NAME [![Build Status](https://travis-ci.org/wanderer/edt.svg?branch=master)](https://travis-ci.org/wanderer/edt)
  edt - ethereum development tool

# SYNOPSIS 
A collection of tools for develpment

#TOOLS
- [bcm](#bcm)
- [esm](#esm)

# bcm
BlockChain Manager (bcm) allows you to export the blockchain as json 

## USAGE
`bcm <command> [OPTION] `


## COMMANDS                     
`export - exports the blockchain in json format`

## OPTIONS                                                   
```
-p     --path The location to the folder which has the blockchain db
-c     --cpp  dumps Alethzero's blochchain                                   
-n     --node dumps node-ethereum's blochchain     
-l     --limit limits number of block to dump by a given number                                                         
-s     --start the hash to start dumping the blockchain. 
               By default bcm loads the best block and works backwards to the genisis hash.
               Usally only the first couple of bytes of a hash are needed.
```

# esm
The Ethereum State Manager (esm) allows you to export the currect state of ethereum in json 

# USAGE
`esm <command> [OPTION] `


# COMMANDS                     
`export - exports the blockchain in json format`

# OPTIONS                                                   
```
-p     --path The location to the folder which has the state db
-c     --cpp  dumps Alethzero's state                          
-n     --node dumps node-ethereum's state 
```
