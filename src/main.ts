export {OChatApp as App} from "./app";
export {OChatConnection as Connection} from "./connection";
export {OChatContact as Contact} from "./contact";
export {OChatContactAccount as ContactAccount} from "./contact-account";
export {OChatDiscussion as Discussion} from "./discussion";
export {OChatGroupAccount as GroupAccount} from "./group-account";
export {OChatMessage as Message} from "./message";
export {OChatUser as User} from "./user";
export {OChatUserAccount as UserAccount} from "./user-account";

import {App as IApp} from "./interfaces/app";
import {Connection as IConnection} from "./interfaces/connection";
import {Contact as IContact} from "./interfaces/contact";
import {ContactAccount as IContactAccount} from "./interfaces/contact-account";
import {Discussion as IDiscussion} from "./interfaces/discussion";
import {DiscussionAuthorization as IDiscussionAuthorization} from "./interfaces/discussion-authorization";
import {GroupAccount as IGroupAccount} from "./interfaces/group-account";
import {Message as IMessage} from "./interfaces/message";
import {Proxy as IProxy} from "./interfaces/proxy";
import {User as IUser} from "./interfaces/user";
import {UserAccount as IUserAccount} from "./interfaces/user-account";

export namespace interfaces {
  export type App = IApp;
  export type Connection = IConnection;
  export type Contact = IContact;
  export type ContactAccount = IContactAccount;
  export type Discussion = IDiscussion;
  export type DiscussionAuthorization = IDiscussionAuthorization;
  export type GroupAccount = IGroupAccount;
  export type Message = IMessage;
  export type Proxy = IProxy;
  export type User = IUser;
  export type UserAccount = IUserAccount;
}
