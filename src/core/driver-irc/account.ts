import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";
import {DiscussionIRC} from "./discussion";
import {ClientConnection} from "./client-connection";

interface AccountIrcOptions{
  login: string;
}

export class AccountIRC implements Account{

  protocols:string;
  data:any;

  constructor(server: string, nick: string){
    this.data = {
      server: server,
      nick: nick
    }
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
