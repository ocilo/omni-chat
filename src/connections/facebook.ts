import * as readline from "readline";
import * as Bluebird from "bluebird";
import {Connection as FacebookConnection} from "palantiri-driver-facebook";

export function getConnection(connectionDescriptor?: any): Bluebird<FacebookConnection> {
  return getOptions(connectionDescriptor).then(options => new FacebookConnection(options));
}

function getOptions(connectionDescriptor?: any): Bluebird<any> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: any = {};

  return Bluebird
    .try(() => {
      if (connectionDescriptor && connectionDescriptor.email) {
        return Bluebird.resolve(connectionDescriptor.email);
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
      console.log(credentials);
      return {credentials: credentials};
    });
}
