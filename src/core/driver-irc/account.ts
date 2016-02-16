import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {DiscussionIRC} from "./discussion";
import {ClientIRC} from "./client/client";

export interface AccountIRCData{
  server: string,
  username: string,
  nick?: string,
  password?: string
}

export class AccountIRC implements Account{
  private static clients: {[id: string]: ClientIRC} = {};

  private static getOrCreateClient(account: AccountIRC): ClientIRC {
    let id = `${account.data.nick}@${account.data.server}`;
    if(!(id in AccountIRC.clients)) {
      AccountIRC.clients[id] = new ClientIRC({server: account.data.server, nick: account.data.nick});
    }
    return AccountIRC.clients[id];
  }

  protocols:string;
  data:any;

  constructor(data: AccountIRCData){
    this.data = data;
    if(!this.data.nick){
      this.data.nick = this.data.username;
    }
  }

  getOrCreateClient(): ClientIRC {
    return AccountIRC.getOrCreateClient(this);
  }

  connect(): Promise<any>{
    return this.getOrCreateClient()
      .connect();
  }

  getDiscussions(): Promise<Discussion[]> {
    let client = this.getOrCreateClient();
    return client
      .connect()
      .then(() => {
        client.send("JOIN", ["#test"]);
        client.send("LIST");
        return [];
      });
  }

  createDiscussion(name:string):Promise<DiscussionIRC> {
    let discussion: DiscussionIRC = new DiscussionIRC(this, name);
    return discussion
      .connect();
  }
}
