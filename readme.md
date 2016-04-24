# Omnichat

## Description

OmniChat is a service library 

## Structure

`App` is the shared context. It contains:

- The list of available drivers/functions to acquire a palantiri connection
- The active palantiri connections
- The active users

`User` a user represent a set of accounts owned by the same person. It contains:

- The list of accounts
- The list of active discussions

`Account` is the high-level representation of everything you can do with an account

- `getOrCreateConnection`: internal use, allows to open the connection for this account
- `sendMessage(msg, discussion)`: sends a message to the discussion

`Discussion` is an object representing a group of palantiri-discussions. For each discussion, it knows which local account to use.
Currently it does not support nested `Discussions` recursively.

- `sendMessage(msg)`: sends the message to every sub-discussion


## Install

````bash
npm install
gulp build.node
````

