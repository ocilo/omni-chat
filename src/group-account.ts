import {ContactAccount} from "./interfaces/contact-account";
import {GroupAccount} from "./interfaces/group-account";

export class OChatGroupAccount implements GroupAccount {
  protocol: string;

  members: ContactAccount[];

  localDiscussionID: number;

  addMembers(members: ContactAccount[], callback?: (err: Error, members: ContactAccount[]) => any): void {
    let err: Error = null;

    for(let account of members) {
      if(account.protocol.toLocaleLowerCase() !== this.protocol.toLocaleLowerCase()) {
        if(!err) {
          err = new Error("One of the accounts does not have the right protocol.");
        }
      } else {
        if(this.members.indexOf(account) !== -1) {
          if(!err) {
            err = new Error("One of the account is already a member.");
          }
        } else {
          this.members.push(account);
          //this.localDiscussionID = null;  // We maybe need to do this
          // TODO : we must add the member to the real group too,
          //        i.e. through the driver.
          //        Could we do this directly in Discussion.addParticipants() ?
        }
      }
    }

    if(callback) {
      callback(err, this.members);
    }
  }
}
