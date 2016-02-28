//// import * as irc from "irc";
//import Client from "../client/client";
//import * as Promise from "bluebird";
//import {Discussion} from "../interfaces";
//import {DiscussionIRC} from "./discussion";
//
//export class ClientConnection{
//
//  static connections: {[name: string]: ClientConnection} = {};
//
//  static getConnection(server: string, nick: string){
//    let id = `${nick}@${server}`;
//    if(!(id in ClientConnection.connections)){
//      new ClientConnection(server, nick);
//    }
//    return ClientConnection.connections[id];
//  }
//
//  connected: boolean = false;
//  server: string;
//  nick: string;
//
//  client: Client;
//
//  constructor(server: string, nick: string){
//    this.server = server;
//    this.nick = nick;
//    let id = `${nick}@${server}`;
//    ClientConnection.connections[id] = this;
//    this.client = new Client(this.server, this.nick, {autoConnect: false, debug: true});
//  }
//
//  connect(retryCount: number = 3): Promise<any>{
//    return new Promise((resolve, reject) => {
//      this.client.connect(retryCount, (welcomeMsg) => {
//        // TODO(Charles): handle welcomeMsg
//
//        this.connected = true;
//        console.log('connected');
//        resolve();
//      });
//    });
//  }
//
//  join(discussion: DiscussionIRC): Promise<any>{
//    return new Promise((resolve, reject) => {
//      if(discussion.server !== this.server){
//        return reject(new Error(`Unable to join discussion on different server`));
//      }
//
//      console.log(`joining ${discussion.name}`);
//
//      this.client.join('#'+discussion.name, (joinArgs) => {
//        // TODO(Charles): handle joinArgs
//        resolve();
//      });
//    });
//  }
//}
