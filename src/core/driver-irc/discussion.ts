import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {AccountIRC} from "./account";

interface IRCoptions{
  login: string;
}

export enum DiscussionIRCType{
  GLOBAL,
  LOCAL
}

export class DiscussionIRC implements Discussion{
  account: AccountIRC;
  creationDate:Date;
  // server: string;
  type: DiscussionIRCType;
  name: string;
  isPrivate:boolean;

  constructor(account: AccountIRC, name: string, type: DiscussionIRCType = DiscussionIRCType.GLOBAL){
    this.account = account;
    // this.server = account.data.server;
    this.type = type;
    this.name = name;
    this.isPrivate = false;
    this.creationDate = new Date();
  };

  private getPrefixedName(): string{
    let prefix = this.type === DiscussionIRCType.GLOBAL ? "#" : "&";
    return `${prefix}${this.name}`;
  }

  connect(): Promise<DiscussionIRC>{
    return this.account
      .getOrCreateClient()
      .join(this.getPrefixedName())
      .thenReturn(this);
  }

  getMessages():Promise<Message[]> {
    return Promise.resolve([]);
  };

  sendMessageString(msg: string): Promise<any>{
    let client = this.account.getOrCreateClient();
    return client.say(this.getPrefixedName(), msg);
    /*return this
      .connect()
      .then(() => {
        let client = this.account.getOrCreateClient();
        return client.say(this.getPrefixedName(), msg);
      });*/
  }

  sendMessage(msg: Message): Promise<any> {
    return this
      .connect()
      .then(() => {
        let client = this.account.getOrCreateClient();
        client.say(this.getPrefixedName(), msg.getText());
      })
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
