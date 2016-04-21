import * as Bluebird from "bluebird";
import {User} from "./user";

/***************************************************************
 * App is the entry point for the library.
 * It maintains the list of connected users.
 ***************************************************************/
export interface App {
  users: User[];      // Currently connected users for this app

  getUsers(filter?: (user: User) => boolean): Bluebird.Thenable<User[]>;
  //  Return all Users connected through the current App.
  //  If "filter" is precised, only returns Users for which
  //  filter return true.

  addUser(user: User, callback?: (err: Error, users: User[]) => any): Bluebird.Thenable<App>;
  //  Ajoute l'utilisateur "user" a la liste des utilisateurs
  //  qui utilisent l'App courante, si "user" ne fait pas
  //  deja partie de ceux qui utilisent cette App.
  //  Sinon, err sera non nul.

  removeUser(user: User, callback?: (err: Error, users: User[]) => any): Bluebird.Thenable<App>;
  //  Supprime l'utilisateur "user" de la liste des utilisateurs
  //  qui utilise l'App courante, si "user" faisait deja
  //  partie de la liste.
  //  Sinon, ne fait rien , et err sera non nul.
}
