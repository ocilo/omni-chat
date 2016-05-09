import {AppInterface} from "./interfaces/app";
import {UserInterface} from "./interfaces/user";

export class App implements AppInterface {
  /**
   * The list of all the users using this app.
   */
  users: UserInterface[] = [];

  /**
   * Return the list of connected Users.
   * If filter is specified, return only the Users for chich
   * filter returns true.
   * @param filter
   * @returns {UserInterface[]}
   */
  getUsers(filter?: (user: UserInterface) => boolean): UserInterface[] {
    if(filter) {
      let okUsers: UserInterface[] = [];
      for(let user of this.users) {
        if(filter(user)) {
          okUsers.push(user);
        }
      }
      return okUsers;
    }
    return this.users;
  }

  /**
   * Add the User to the app.
   */
  addUser(user: UserInterface): AppInterface {
    if(this.users.indexOf(user) !== -1) {
      throw new Error("This user is already connected to this client.");
    } else {
      this.users.push(user);
    }
    return this;
  }

  /**
   * Remove the first User which matchs user from the app.
   */
  removeUser(user: UserInterface): AppInterface {
    if(this.users.indexOf(user) === -1) {
      throw new Error("This user was not connected to this client.");
    } else {
      this.users.splice(0, 1, user);
    }
    return this;
  }
}
