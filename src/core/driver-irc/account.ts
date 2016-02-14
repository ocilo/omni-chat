import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {DiscussionIRC} from "./discussion";
import {ClientConnection} from "./client-connection";

export interface AccountIRCData{
  server: string,
  username: string,
  nick?: string,
  password?: string
}

export class AccountIRC implements Account{
  protocols:string;
  data:any;

  constructor(data: AccountIRCData){
    this.data = data;
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
