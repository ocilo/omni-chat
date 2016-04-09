import * as Promise from "bluebird";

import {EventEmitter} from "events";

import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "./account";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";

interface IRCoptions{
  login: string;
}

export class DiscussionIRC extends EventEmitter implements Discussion {

  creationDate: Date;
  server: string;
  name: string;
  isGroupDiscussion: boolean;
  isPrivate: boolean;

  constructor (server: string, name: string) {
    super();
    this.server = server;
    this.name = name;
    this.isPrivate = false;
    this.creationDate = new Date();
  };

  getMessages(): Message[] {
    return undefined;
  };

  sendText(authorAccount: Account, text:string): Promise<Message> {
    return authorAccount
      .getClient()
      .say(this.name, text);
    // return undefined;
  }

  sendMessage(authorAccount: Account, msg:Message): Promise<Message> {
    authorAccount
      .getClient();
    return null;
  };

  addParticipants(p:Contact[]): Promise<any> {
    return null;
  };

  getParticipants(): Contact[] {
    return null;
  };

  onMessage(callback:(msg:Message)=>any): Discussion {
    return this;
  };

  getName(): string {
    return null;
  };

  getDescription(): string {
    return null;
  };

  getSettings(): any {
    return null;
  };
}
