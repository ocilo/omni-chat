import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";
import {ContactAccountInterface} from "./interfaces/contact-account";
import {DiscussionInterface} from "./interfaces/discussion";
import {UserAccountInterface} from "./interfaces/user-account";
import {ContactAccount} from "./contact-account";
import {SimpleDiscussion} from "./simple-discussion";
import {driversStore} from "./drivers-store";

export class UserAccount implements UserAccountInterface {
	/**
   * The low-level object representing this account.
   */
  protected accountData: palantiri.UserAccount;

  constructor (accountData: palantiri.UserAccount) {
    this.accountData = accountData;
  }

  /**
   * Returns the global id (driver + internal id) of this user-account.
   */
  getGlobalId(): Bluebird<palantiri.AccountGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.accountData));
  }

  /**
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Bluebird<palantiri.Connection> {
    return Bluebird.resolve(driversStore.getOrCreateConnection(this));
  }

  /**
   * An alias for getOrCreateConnection().connect().
   */
  getOrCreateApi(): Bluebird<palantiri.Api> {
    return Bluebird.resolve(driversStore.getOrCreateApi(this));
  }

  /**
   * Returns a list of account-specific contact-accounts.
   */
  getContactAccounts(): Bluebird<ContactAccount[]> {
    return Bluebird.resolve(this.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.getContacts()
      })
      .map((account: palantiri.Account) => {
        return new ContactAccount(account);
      });
  }

  /**
   * Returns a list of account-specific discussions.
   */
  getDiscussions(): Bluebird<SimpleDiscussion[]> {
    return Bluebird.resolve(this.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.getDiscussions()
      })
      .map((discussion: palantiri.Discussion) => {
        return new SimpleDiscussion(this, discussion);
      });
  }

  /**
   * Returns a Discussion with the contact-account(s) remoteContactAccount.
   * @param remoteContactAccounts
   */
  getOrCreateDiscussion(remoteContactAccounts: ContactAccountInterface[]): Bluebird<DiscussionInterface> {
    return Bluebird.resolve(this.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.getContacts();
      })
      .then((contacts: palantiri.Account) => {
        for(let wantedAccount of remoteContactAccounts) {
          if(!(wantedAccount in contacts)) {
            return Bluebird.reject(new Incident(wantedAccount, "This account is not part of the contacts."));
          }
        }
        return this.getOrCreateApi();
      })
      .then((api: palantiri.Api) => {
        return api.getDiscussions();
      })
      .then((discussions: palantiri.Discussion[]) => {
        let discuss: SimpleDiscussion = null;
        if(!discussions || discussions.length === 0) {
          discuss = new SimpleDiscussion(this);
          for(let participant of remoteContactAccounts) {
            discuss.addParticipant(participant);
          }
          // TODO(not) : maybe wanting to just add missing participants from a discussion which
          //             already have some of the participants we are looking for is a bad idea,
          //             since we don't know the meanings of the previous discussion and the new one.
        } else if(discussions.length !== 1) {
          // TODO : and in this weird case ?
        } else {
          discuss = new SimpleDiscussion(this, discussions[0]);
        }
        return discuss;
      });
  }
}

export default UserAccount;
