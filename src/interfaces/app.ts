import {UserInterface} from "./user";

/***************************************************************
 * App is the entry point for the library.
 * It maintains the list of connected users.
 ***************************************************************/
export interface AppInterface {
  /**
   * Return the list of connected Users.
   * If filter is specified, return only the Users for chich
   * filter returns true.
   */
  getUsers(filter?: (user: UserInterface) => boolean): UserInterface[];

	/**
   * Add the User to the app.
   */
  addUser(user: UserInterface): AppInterface;

	/**
   * Remove the first User which matchs user from the app.
   */
  removeUser(user: UserInterface): AppInterface;
}

export default AppInterface;
