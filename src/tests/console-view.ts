import * as readline from "readline";
import * as Bluebird from "bluebird";
import {Incident} from "incident";
import {App} from "../app";
import {User} from "../user";

export class ConsoleView {
  app: App;

  prompt: any;

  constructor() {
    this.app = new App();
    this.prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  connectUser(): Bluebird.Thenable<User> {
    return Bluebird
      .fromCallback((cb) => {
        this.prompt.question("Name of the user you want to connect: ", (name: string) => cb(null, name));
      })
      .then((name: string) => {
        return getUserFromDatabaseByName(name);
      })
      .then((user: User) => {
        return Bluebird.resolve(this.app.addUser(user))
          .thenReturn(user);
      });
  }
}

let userDatabase: User[] = [
  new User("Ruben"),
  new User("OChat.frif"),
  new User("Charles")
];

function getUserFromDatabaseByName(name: string) : Bluebird.Thenable<User> {
  return Bluebird
    .map(userDatabase, (user: User) => {
      return user.getName()
        .then((username: string) => {
          return {user: user, name: username};
        });
    })
    .then((namedUsers: {user: User, name: string}[]) => {
      for(let user of namedUsers) {
        if(user.name === name) {
          return Bluebird.resolve(user.user);
        }
      }
      return Bluebird.reject(new Incident("Unknown user", {name: name}, "No user with such a name."));
    })
}
