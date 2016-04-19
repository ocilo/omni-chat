import * as Bluebird from "bluebird";
import {Proxy} from "./proxy";
import {User} from "./user";

/***************************************************************
 * App is the entry point for the library.
 * Maintains the list of available proxies and connected users.
 ***************************************************************/
export interface App {
  drivers: Proxy[];   // Available proxies for this app

  users: User[];      // Currently connected users for this app

  getProxyFor(protocol: string): Bluebird.Thenable<Proxy>;
  //  Retourne le premier proxy permettant d'utiliser
  //  le protocole "protocol".

  addDriver(driver: Proxy, callback?: (err: Error, drivers: Proxy[]) => any): App;
  //  Ajoute le proxy "driver" a la liste des drivers supportes
  //  par cette App, si l'App ne possede pas deja un proxy
  //  qui gere le meme protocole que "driver".
  //  Sinon, err sera non nul.

  removeDriversFor(protocol: string, callback?: (err: Error, drivers: Proxy[]) => any): App;
  //  Supprime tout les drivers connus de l'App qui supportent
  //  le protocole "protocol".
  //  Ne fait rien si aucun des drivers connus ne supporte
  //  le protocole "protocol". Dans ce cas, err sera non nul.

  addUser(user: User, callback?: (err: Error, users: User[]) => any): App;
  //  Ajoute l'utilisateur "user" a la liste des utilisateurs
  //  qui utilisent l'App courante, si "user" ne fait pas
  //  deja partie de ceux qui utilisent cette App.
  //  Sinon, err sera non nul.

  removeUser(user: User, callback?: (err: Error, users: User[]) => any): App;
  //  Supprime l'utilisateur "user" de la liste des utilisateurs
  //  qui utilise l'App courante, si "user" faisait deja
  //  partie de la liste.
  //  Sinon, ne fait rien , et err sera non nul.
}
