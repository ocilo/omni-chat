import * as Bluebird from "bluebird";

import {ContactAccount} from "./interfaces/contact-account";
import {UserAccount} from "./interfaces/user-account";
import {MSG_FLAG_EDI, Message} from "./interfaces/message";

export class OChatMessage implements Message {
  author: ContactAccount | UserAccount;

  body: string;

  content: any;

  flags: number;

  creationDate: Date;

  lastUpdated: Date;

  getText(): Bluebird<string> {
    return Bluebird.resolve(this.body);
  }

  getCreationDate(): Bluebird<Date> {
    return Bluebird.resolve(this.creationDate);
  }

  getLastUpdateDate(): Bluebird<Date> {
    return Bluebird.resolve(this.lastUpdated);
  }

  getAuthor(): Bluebird<ContactAccount | UserAccount> {
    return Bluebird.resolve(this.author);
  }

  getContent(): Bluebird<any> {
    return Bluebird.resolve(this.content);
  }

  getFlags():Bluebird<number> {
    return Bluebird.resolve(this.flags);
  }

  isEditable(): boolean {
    return (this.flags & MSG_FLAG_EDI) === MSG_FLAG_EDI;
  }
}
