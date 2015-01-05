esm(1) -- ethereum state mananger
==============================

## SYNOPSIS

  `esm <command> [args]`

## VERSION

@VERSION@

## DESCRIPTION

esm is a collection of utilties for managing the the ethereum state.

It is extremely useful for developing Dapps.

Run `esm --help` to get a list of available commands.

## INTRODUCTION
The Ethereum state is stored in a merkle patricia tree. This utility can read and create tries and preform various task on it.

## DIRECTORIES

ems has two modes:

* global mode:
  esm looks in `~/.ethereum/state`
* local mode:
  ems looks in `./.ethereum/state`
  
ems looks local first the globally

## OPTIONS

  --help  
    display help
  --path
    the path to the state db.

## COMMANDS

  **ems-export**(1)  
    exports the current state to a json file  

  **ems-import**(1)  
    imports the current state from a json file  

  **ems-init**(1)  
    initailizes the current directory with a state directory  

  **ems-mark**(1)  
    marks the current state in a log so that it can be used again later  
  
  **ems-root**(1)  
    sets or gets the current state root  

  **ems-account**(1)  
    account creation and manipulation   

  **ems-label**(1)  
    labal acounts for easy access   

## CONTRIBUTIONS

Patches welcome!

* docs:
  If you find an error in the documentation, edit the appropriate markdown
  file in the "doc" folder.  (Don't worry about generating the man page.)

Contributors are listed in npm's `package.json` file.  You can view them
easily by doing `npm view npm contributors`.

If you would like to contribute, but don't know what to work on, check
the issues list or ask on the forms or on IRC.

* <http://github.com/ethereum/ethereumjs-tools/issues>
* <https://forum.ethereum.org/categories/node-ethereum>
* #dev-ethereum  on irc.freenode.net

## BUGS

When you find issues, please report them:

* web:
  <http://github.com/ethereum/ethereumjs-tools/issues>

You can also look for null_radix in #dev-ethereum on irc://irc.freenode.net. 

## AUTHOR

[Martin Becze](https://wanderer.github.io/) - mb @ ethdev.com

## SEE ALSO

*
