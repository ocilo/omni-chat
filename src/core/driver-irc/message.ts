import {Message as IMessage} from "../interfaces";
import {Account} from "./account";

export class Message implements IMessage{
  server: string;
  room: string;
  author: string;
  content: string;
  creationDate: Date;

  getText(): string {
    return this.content;
  }

  getCreationDate(): Date {
    return this.creationDate;
  }

  getLastUpdateDate(): Date {
    return this.creationDate;
  }

  getAuthor(): Account {
    return new Account({server: this.server, username: this.author});
  }

  getContent(): any {
    return {
      type: "text",
      value: this.content
    };
  }
}
