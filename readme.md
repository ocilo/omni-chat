[![npm](https://img.shields.io/npm/v/omni-chat.svg?maxAge=2592000)](https://www.npmjs.com/package/omni-chat)

# OmniChat

## Description

OmniChat is a framework to easily manage real-time communication across
multiple service providers such as Facebook or Skype.

## Quickstart

### Installation

~~Install the module from **npm**:~~ Not available yet.
````bash
npm install --save omni-chat
````

Clone from Github, build it and then link it:
````bash
git clone https://github.com/insa-frif/omni-chat
cd omni-chat
npm install
typings install
gulp project.dist.node
npm link
# And then in you project:
npm link omni-chat
````

In order to connect to a service, you need to install some [drivers](#drivers)

````bash
npm install --save palantiri-driver-facebook
````

Note that `omni-chat` also exposes its **Typescript** definition. You can
install them with [`typings`](https://github.com/typings/typings).

````bash
typings install --save npm:omni-chat npm:palantiri-driver-facebook
````

### Creating a connection

This section uses **Typescript** with **ES6** syntax, but this package
is fully compatible with **Javascript ES5**.

Start by importing `omni-chat` and your drivers.

````typescript
import * as omniChat from "omni-chat";
import * as facebookDriver from "palantiri-driver-facebook";
````

The entry point for an `omni-chat` application is called `App`.
In order to use our Facebook driver, we need to register it on the `App`
object.

Each driver needs some driver-specific options to establish a connection:
the most common example are credentials for password-protected accounts.
Registering a driver means linking a driver to `ConnectionProvider`: a
function that takes care of acquiring the driver-specific options and
return a `Connection`.

````typescript
// App.useDriver(connection, connectionProvider)
omniChat.app.useDriver(
  // We provide the registered Connection
  facebookDriver.Connection,
  // UserAccount provides data about the account we try to connect to
  (userAccount: UserAccount) => {
    let options: facebookDriver.ConnectionOptions;
    
    // In this example, our driver provide a connection to only one account,
    // but in reality this should prompt for credentials, check a db, read a config file, etc.
    options = {
      credentials: {
        email: "YOUR_EMAIL",
        password: "YOUR_PASSWORD"
      }
    };
    let connection = new facebookDriver.Connection(options);
    // You can also return a Promise
    return connection;
  }
);
````

Once you registered the driver, you can create a User and add him some accounts.

````typescript
// Create a user
let user = new omniChat.User();

// Create a facebook account
let account = new omniChat.Account({
  driverName: "facebook",
  // ...
});

// Add the account to the user.
user.addAccount(account);
````

The setup is now finished and you can use `omni-chat`:

````typescript
user.getAccounts()
  .then((accounts: omniChat.AccountInterface[]) => {
    accounts.forEach((account) => {
      account.listen() // Connect if not already connected and receive messages
        .then(account => {
          return account.getDiscussion()
        })
        .then((discussions: omnichat.DiscussionInterface[]) => {
          discussion.each((discussion) => {
            return discussion.sendMessage({body: "Hello world!"})
              .then((message: omniChat.MessageInterface) => {
                console.log("Successfully sent message:");
              });
          });
        })
    });
  })
````

## Drivers

OmniChat accepts any driver following the [`Palantiri Interface`](https://github.com/insa-frif/palantiri-interfaces).
Here are some officially supported drivers:

 - [palantiri-driver-facebook](https://github.com/insa-frif/palantiri-driver-facebook);

## API

### Structure

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

### Interfaces

### MetaDiscussions (cross-service discussions)

One of the greatest features offered by `omni-chat` is that the support
for cross-service discussions and messages.
These discussions and messages spanning across multiple services are
called `MetaDiscussion`s and `MetaMessage`s (as opposed to
single-account/single service `SimpleDiscussion`s and `SimpleMessage`s).

A `MetaDiscussion` is a tree of of sub-discussions (either other
`MetaDiscussion`s or `SimpleDiscussion`s).
A `SimpleDiscussion` is bound to a single `UserAccount`, but a
`MetaDiscussion` can contain sub-discussions using various accounts.
The restriction is that one `User` has to own every `UserAccount` involved.

````
let alice: omniChat.User;
// ...

Bluebird.join(
  alice.getDiscussions({driverName: "facebook}),
  alice.getDiscussions({driverName: "skype}),
  (facebookDiscussions, skypeDiscussions) => {
    // we pick one of the discussions
    let fbDiscussion = facebookDiscussions[0]; // a SimpleDiscussion
    let skypeDiscussion = skypeDiscussions[0]; // another SimpleDiscussion
    
    let crossDiscussion = new MetaDiscussion(alice); // Create a new meta-discussion, only alice's conversations can be used here
    
    return Bluebird
      .all([
        crossDiscussion.addDiscussion(fbDiscussion),
        crossDiscussion.addDiscussion(skypeDiscussion)
      ])
      .then(() => {
        // We now have the following tree:
        //
        // crossDiscussion
        // ├- fbDiscussion
        // └- skypeDiscussion
        //
        // When using sendMessage or other methods, the message propagate across the whole sub-tree:
        
        fbDiscussion.sendMessage({body: "fb-only message"}); // The result will be a SimpleMessage
        skypeDiscussion.sendMessage({body: "skype-only message"}); // The result will be a SimpleMessage
        crossDiscussion.sendMessage({body: "meta message: propagated to both fbDiscussion & skypeDiscussion"}); // The result will be a MetaMessage
      });
  }
);
````

````txt
               +-----------------------+
               |    MetaDiscussion     |
               +-----------------------+
               |user:    Alice         |
               +-----------------------+
               |fbBob                  |
               |fbCharlie              |
               |skypeDan               |
               +--+-----------------+--+
                  |                 |
                  |                 |
                  v                 v
+-----------------+-----+     +-----+-----------------+
|   SimpleDiscussion    |     |   SimpleDiscussion    |
|      (facebook)       |     |       (skype)         |
+-----------------------+     +-----------------------+
|user:    Alice         |     |user:    Alice         |
|account: fbAlice       |     |account: skypeAlice    |
+-----------------------+     +-----------------------+
|fbBob                  |     |skypeDan               |
|fbCharlie              |     |                       |
+-----------------------+     +-----------------------+
````

A MetaDiscussion can also link to discussions using the same driver. But beware that contact-accounts are relative to the user-account.

````typescript
alice.getAccounts({driverName: "facebook"})
  .then(accounts => {
    let fbWorkAccount = accounts[0];
    let fbFamilyAccount = accounts[1];
    
    return Bluebird.join(
      fbWorkAccount.getDiscussions(),
      fbFamilyAccount.getDiscussions(),
      
      
  });

let fbFamilyAccount: SimpleDiscussion;
let fbWorkAccount: SimpleDiscussion;
````

````txt
               +-----------------------+
               |    MetaDiscussion     |
               +-----------------------+
               |user:    Alice         |
               +-----------------------+
               |fbBoss                 |
               |fbBob (fbAliceWork)    |
               |fbMom                  |
               |fbBob (fbAlicePrivate) |
               +--+-----------------+--+
                  |                 |
                  |                 |
                  v                 v
+-----------------+-----+     +-----+-----------------+
|   SimpleDiscussion    |     |   SimpleDiscussion    |
|      (facebook)       |     |      (facebook)       |
+-----------------------+     +-----------------------+
|user:    Alice         |     |user:    Alice         |
|account: fbAliceWork   |     |account: fbAlicePrivate|
+-----------------------+     +-----------------------+
|fbBoss                 |     |fbMom                  |
|fbBob                  |     |fbBob                  |
+-----------------------+     +-----------------------+
````

You can even have multiple discussions using the same driver and the
same account!
A meta-discussion does not modify its child discussion unless you
explicitly asks for it. If you want to reduce any redundancy, you can use
the following methods to optimize the tree:

#### `metaDiscussion.flatten()`

This will traverse the tree and remove any intermediary `MetaDiscussion` (every sub-discussion will be a `SimpleDiscussion`).

#### `metaDiscussion.mergeSimpleDiscussions()`

This will try to merge every child `SimpleDiscussion` linked by the same `UserAccount` into a single `SimpleDiscussion`. (There will be one `SimpleDiscussion` per `UserAccount`)

### MetaMessages

By offering the possibility to communicate with multiple `SimpleDiscussion`s,
a `MetaDiscussion` has to also unify the `SimpleMessage`s into `MetaMessage`s.
A `MetaMessage` is a tree of equivalent message. The message equivalence is defined as follow:

 - The messages have the same `body`
 - The difference of the `creationDate` is less than 5 minutes
 - The authors are equivalent. The authors are equivalent if one of the following is true:
   - Both messages are `SimpleMessage`s and both `UserAccount`s are the same.
   - Both messages are `SimpleMessage`s and both `UserAccount`s are owned by the same `User`
   - Both messages are `MetaMessage`s and both have the same `User`
   - There is one `MetaMessage` and a `SimpleMessage` whose `UserAccount` is owned by the same `User`
   - **TODO**: define the equivalence of messages sent by the contacts...

### Dependency tree

````txt
                 +----------------------------------------------+
                 |                                              |
      +--------->+            palantiri-interfaces              |
      |          |                                              |
      |          +-----+----------------+----------------+------+
      |                ^                ^                ^
      |                |                |                |
+-----+------+   +-----+------+   +-----+------+   +-----+------+
|            |   | palantiri- |   | palantiri- |   | palantiri- |
|            |   |  driver-   |   |  driver-   |   |  driver-   |
|            |   |  facebook  |   |   skype    |   |   other    |
|            |   +-----+------+   +-----+------+   +-----+------+
|   omni-    |         ^                ^                ^
|   chat     |         |                |                |
|            |   +-----+----------------+----------------+-------+
|            |   |                                               |
|            +<--+                 user-package                  |
|            |   |                                               |
+------------+   +-----------------------------------------------+
````
