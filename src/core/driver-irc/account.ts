import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {DiscussionIRC} from "./discussion";
import {ClientConnection} from "./client-connection";
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

  createDiscussion(name:string):Promise<Discussion> {
    let clientConnection = ClientConnection.getConnection(this.data.server, this.data.nick);

    return clientConnection
      .connect()
      .then(() => {
        console.log('connected');
        let discussion = new DiscussionIRC(this.data.server, name);
        clientConnection.join(discussion);
        return discussion;
      });
  }
}
