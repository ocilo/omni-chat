export {App} from "./app";
export {driversStore} from "./drivers-store";
export {ContactAccount} from "./contact-account";
export {MetaDiscussion} from "./meta-discussion";
export {MetaMessage} from "./meta-message";
export {SimpleMessage} from "./simple-message";
export {SimpleDiscussion} from "./simple-discussion";
export {User} from "./user";
export {UserAccount} from "./user-account";

import * as interfaces from "./interfaces/index";

export namespace interfaces {
  export type AppInterface = interfaces.AppInterface;
  export type ContactAccountInterface = interfaces.ContactAccountInterface;
  export type DiscussionInterface = interfaces.DiscussionInterface;
  export type DriversStoreInterface = interfaces.DriversStoreInterface;
  export type MessageInterface = interfaces.MessageInterface;
  export type UserInterface = interfaces.UserInterface;
  export type UserAccountInterface = interfaces.UserAccountInterface;
}
