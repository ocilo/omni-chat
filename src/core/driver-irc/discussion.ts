import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {ClientConnection} from "./client-connection";

interface IRCoptions{
  login: string;

}

export class DiscussionIRC implements Discussion{
  creationDate:Date;
  server: string;
  name: string;
  isPrivate:boolean;

  constructor(server: string, name: string){
    this.server = server;
    this.name = name;
    this.isPrivate = false;
    this.creationDate = new Date();
  };

  getMessages():Message[] {
    return undefined;
  };

  sendMessage(msg:Message) {
  };

  addParticipants(p:Contact[]) {
  };

  getParticipants():Contact[] {
    return undefined;
  };

  onMessage(callback:(msg:Message)=>any) {
  };

  getName():string {
    return undefined;
  };

  getDescription():string {
    return undefined;
  };

  getSettings():any {
    return undefined;
  };
}
