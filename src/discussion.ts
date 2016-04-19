import * as Bluebird from "bluebird";

import {User} from "./interfaces/user";
import {Discussion} from "./interfaces/discussion";
import {ContactAccount} from "./interfaces/contact-account";
import {GroupAccount} from "./interfaces/group-account";
import {Message} from "./interfaces/message";
import {Dictionary} from "./interfaces/utils";

export class OChatDiscussion implements Discussion {
  creationDate: Date;

  name: string;

  isPrivate: boolean;

  heterogeneous: boolean;

  description: string;

  participants: GroupAccount[];

  owner: User;

  settings: Dictionary<any>;

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Bluebird<Message[]> {
    // TODO : this depends on how we manage heterogeneous ContactAccount
    //        see above in OchatUser.getOrCreateDiscussion
    return undefined;
  }

  sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): void {
    let err: Error = null;
    for(let recipient of this.participants) {
      let gotIt: boolean = false;
      // TODO : rework this
      for(let ownerAccount of this.owner.accounts) {
        if(ownerAccount.driver.isCompatibleWith(recipient.protocol)) {
          ownerAccount.sendMessageTo(recipient, msg, callback);
          gotIt = true;
          break;
        }
      }
      if(!err && !gotIt) {
        err = new Error("At least one recipient could not be served.");
      }
    }
    callback(err, msg);
  }

  addParticipants(p: GroupAccount): Bluebird<Discussion> {
    if(this.participants.indexOf(p) === -1) {
      let param: string[] = [p.protocol];
      this.owner.getAccounts(param).then((ownerAccounts) => {
        let compatibleParticipants: GroupAccount[] = [];
        for(let participant of this.participants) {
          if(participant.protocol === p.protocol) {
            compatibleParticipants.push(participant);
          }
        }
        let gotIt: boolean = false;
        for(let compatibleParticipant of compatibleParticipants) {
          for(let ownerAccount of ownerAccounts) {
            if(ownerAccount.hasContactAccount(compatibleParticipant.members[0])) {
              // Ok, we have determined which one of the user's accounts
              // owns the current compatible participant.
              // Now if it owns the ContactAccounts that we want to add
              // to this discussion too, we win.
              if(ownerAccount.hasContactAccount(p.members[0])) {
                // That's it, we win !
                ownerAccount.driver.addMembersToGroupChat(p.members, compatibleParticipant, (err) => {
                  if(!err) {
                    compatibleParticipant.addMembers(p.members);
                  }
                });
                gotIt = true;
                break;
              }
            }
          }
          if(gotIt) {
            break;
          }
        }
        // In the case where we still not have been able to add these participants,
        // there is two solutions :
        if(!gotIt) {
          if(compatibleParticipants.length === 0) {
            // First, we are trying to add accounts using a protocol which is
            // not in this discussion yet. We just have to add these participants
            // to this discussion, which will become heterogeneous.
            this.participants.push(p);
            this.heterogeneous = true;
          } else {
            // Second, we are trying to add accounts from an UserAccount which has
            // no current contacts in this discussion. We just have to add them.
            this.participants.push(p);
          }
          // TODO : but how the new participants will know that they are in this discussion ?
          //        For the moment, they won't know until we send a message to them.
          //        I don't think that it is a real problem.
          //        If it is, we coud just auto-send a message to them.
        }
      });
    }
    return Bluebird.resolve(this);
  }

  removeParticipants(contactAccount: ContactAccount): Bluebird<Discussion> {
    // TODO
    return Bluebird.resolve(this);
  }

  getParticipants(): Bluebird<GroupAccount[]> {
    return Bluebird.resolve(this.participants);
  }

  onMessage(callback: (msg: Message) => any): Bluebird<Discussion> {
    // TODO : see troubles in interfaces.ts before
    return undefined;
  }

  getName(): Bluebird<string> {
    return Bluebird.resolve(this.name);
  }

  getDescription(): Bluebird<string> {
    return Bluebird.resolve(this.description);
  }

  getSettings(): Bluebird<Dictionary<any>> {
    return Bluebird.resolve(this.settings);
  }
}
