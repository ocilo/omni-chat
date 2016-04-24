import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import DiscussionInterface from "./interfaces/discussion";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";
import MessageInterface from "./interfaces/message";

interface UserAccountData {
  driver: string;
  id: string;

  username?: string;
  // email?: string;
}

export class UserAccount implements UserAccountInterface {
  private app: AppInterface;
  driver: string;
  id: string;

  username: string;
  data: UserAccountData;

  constructor (app, accountData: UserAccountData) {
    this.app = app;
    this.driver = accountData.driver;
    this.id = accountData.id;

    this.username = accountData.username || null;
    this.data = accountData;
  }

  getUser(): Bluebird<UserInterface> {
    return Bluebird.reject(new Incident("todo", "UserAccount:getUser is not implemented"));
  }

  getPalantiriToken(): Bluebird<palantiri.AccountToken> {
    return Bluebird.resolve({driver: this.driver, id: this.id});
  }

  /*
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Bluebird<palantiri.Connection> {
    return Bluebird.reject(new Incident("todo", "UserAccount:getOrCreateConnection is not implemented"));
    // return this.app.getOrCreateConnection(this);
  }

  getOrCreateApi(): Bluebird<palantiri.Api> {
    return Bluebird.reject(new Incident("todo", "UserAccount:getOrCreateApi is not implemented"));
    // return this.app.getOrCreateApi(this);
  }

  /**
   * Send the message "msg" in the discussion "discussion".
   * If the protocol used by "discussion" does not support group discussion,
   * the message will be send to each member individually.
   * If the discussion does not already exist on the accessible service,
   * it will be created.
   * @param msg
   * @param discussion
   */
  sendMessage(msg: MessageInterface, discussion: DiscussionInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "UserAccount:sendMessage is not implemented"));
    // return this.getOrCreateApi()
    //   .then((api: palantiri.Api) => {
    //     api.sendMessage(msg, discussion.id);
    //   })
    //   .thenReturn(this);
  }
}

export default UserAccount;
