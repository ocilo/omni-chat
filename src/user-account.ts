import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
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
        return new SimpleDiscussion(discussion);
      });
  }

  /**
   * Returns a Discussion with the contact-account(s) remoteContactAccount.
   * @param remoteContactAccounts
   */
  getOrCreateDiscussion(remoteContactAccounts: ContactAccountInterface[]): Bluebird<DiscussionInterface> {
    let participantsID: palantiri.AccountGlobalId[] = [];
    let theapi: palantiri.Api = null;
    return Bluebird
      .map(remoteContactAccounts, (contact: ContactAccountInterface) => {
        return contact.getGlobalId();
      })
      .then((ids: palantiri.AccountGlobalId[]): void => {
        participantsID = ids;
      })
      .then(() => {
        return this.getOrCreateApi()
      })
      .then((api: palantiri.Api) => {
        theapi = api;
        return api.getDiscussions({
          max: 1,
          filter: (discuss: palantiri.Discussion): boolean => {
            if(discuss.participants.length !== participantsID.length) {
              return false;
            }
            for(let part of discuss.participants) {
              if(participantsID.indexOf(palantiri.Id.asGlobalId(part)) === -1) {
                return false;
              }
            }
            return true;
          }
        });
      })
      .then((discussions: palantiri.Discussion[]) => {
        let discuss: SimpleDiscussion = null;
        return Bluebird.try(() => {
          if(!discussions || discussions.length === 0) {
            return theapi.createDiscussion(participantsID)
              .then((discussion: palantiri.Discussion) => {
                return new SimpleDiscussion(discussion);
              });
            // NOTE : maybe wanting to just add missing participants from a discussion which
            //        already have some of the participants we are looking for is a bad idea,
            //        since we don't know the meanings of the previous discussion and the new one.
          } else if(discussions.length > 1) {
            // TODO: we need to find the good one...
            discuss = new SimpleDiscussion(discussions[0]);
          } else {
            discuss = new SimpleDiscussion(discussions[0]);
          }
          return discuss;
        });
      });
  }

	/**
   * Return true only if the current account has the given contact
   * in he list of his contacts.
   */
  hasContact(contactAccount: ContactAccountInterface): Bluebird<boolean> {
    return Bluebird.join(
      contactAccount.getGlobalId(),
      this.getContactAccounts().map((contact: ContactAccountInterface) => contact.getGlobalId()),
      (contactId, contactsList) => {
        return contactsList.indexOf(contactId) >= 0;
      }
    );
  }

}

export default UserAccount;
