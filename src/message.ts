import * as Bluebird from "bluebird";

import {ContactAccount} from "palantiri-interfaces";
import {UserAccount} from "palantiri-interfaces";
import {Message} from "palantiri-interfaces";

// TODO: export MessageFlags in "palantiri-interfaces"
// temporary hack, quickly fix this !!!
const MSG_FLAG_TXT = 0x0001;   //  The message contains text
const MSG_FLAG_IMG = 0x0002;   //  The message contains picture(s)
const MSG_FLAG_VID = 0x0004;   //  The message contains video(s)
const MSG_FLAG_FIL = 0x0008;   //  The message contains other file(s)
const MSG_FLAG_URL = 0x0010;   //  The message contains an URL
const MSG_FLAG_EDI = 0x0100;   //  The message is editable

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
