import * as readline from "readline";
import * as Bluebird from "bluebird";
import {Connection as FacebookConnection} from "palantiri-driver-facebook";
import {UserAccount} from "../../user-account";

export {Connection} from "palantiri-driver-facebook";

/**
 * The options required by the facebook driver
 */
// TODO: import from palantiri-driver-facebook, find a way for the driver to describe what it needs (json-schema, via ?)
interface FacebookOptions {
  credentials: {
    email: string;
    password: string;
  }
}

/**
 * Resolves a connection for the `facebook` driver, using the console.
 */
export function facebookFromConsole(account: UserAccount): Bluebird<FacebookConnection>  {
  return getOptions(account)
    .then(options => new FacebookConnection(options));
}

function getOptions(account?: UserAccount): Bluebird<FacebookOptions> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: any = {};

  return Bluebird
    .try(() => {
      if (account && account["email"]) {
        return Bluebird.resolve(account["email"]);
      }

      return Bluebird.fromCallback((cb) => {
        rl.question("Email: ", (res) => cb(null, res));
      });
    })
    .then((email: string) => {
      credentials.email = email;
      return Bluebird.fromCallback((cb) => {
        rl.question("Password: ", (res) => cb(null, res));
      })
    })
    .then((password: string) => {
      credentials.password = password;
      return {credentials: credentials};
    });
}
