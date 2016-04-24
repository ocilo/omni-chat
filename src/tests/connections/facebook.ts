import * as readline from "readline";
import * as Bluebird from "bluebird";
import * as facebook from "palantiri-driver-facebook";
import {UserAccount} from "../../user-account";

export {Connection} from "palantiri-driver-facebook";

/**
 * Resolves a connection for the `facebook` driver, using the console.
 */
export function fromConsole(account: UserAccount): Bluebird<facebook.Connection>  {
  return consolePrompt(account)
    .then(options => new facebook.Connection(options));
}

// TODO: find a better way for the driver to describe what it needs (json-schema, via ?)
/**
 * Acquires the required data by prompting the user with the console
 * @param account
 * @returns {Bluebird<{credentials: any}>}
 */
function consolePrompt(account?: UserAccount): Bluebird<facebook.ConnectionOptions> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: any = {};

  return Bluebird
    .try(() => {
      if (account && (<any> account).email) {
        return Bluebird.resolve(<string> (<any> account).email);
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
