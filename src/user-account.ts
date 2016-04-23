import * as Bluebird from "bluebird";
import {Connection, Message, Discussion, UserAccount as UserAccountData, Api} from "palantiri-interfaces";
import {OChatApp} from "./app";

export class UserAccount {
  private app: OChatApp;

  driver: string;
  id: string;
  data: UserAccountData;

  constructor (app, data: UserAccountData) {
    this.app = app;
    this.driver = data.driver;
    this.id = data.id;
    this.data = UserAccountData;
  }

  /*
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Bluebird<Connection> {
    return this.app.getOrCreateConnection(this);
  }

  getOrCreateApi(): Bluebird<Api> {
    return this.app.getOrCreateApi(this);
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
  sendMessage(msg: Message, discussion: Discussion): Bluebird<UserAccount> {
    return this.getOrCreateApi().then((api: Api) => {
      api.sendMessage(msg, discussion.id);
    })
  }
}
