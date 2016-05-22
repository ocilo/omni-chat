export {App} from "./app";
export {driversStore} from "./drivers-store";
export {ContactAccount} from "./contact-account";
export {MetaDiscussion} from "./meta-discussion";
export {MetaMessage} from "./meta-message";
export {SimpleMessage} from "./simple-message";
export {SimpleDiscussion} from "./simple-discussion";
export {User} from "./user";
export {UserAccount} from "./user-account";

import * as appInterface from "./interfaces/app";
import * as contactAccountInterface from "./interfaces/contact-account";
import * as discussionInterface from "./interfaces/discussion";
import * as driverStoreInterface from "./interfaces/drivers-store";
import * as messageInterface from "./interfaces/message";
import * as userInterface from "./interfaces/user";
import * as userAccountInterface from "./interfaces/user-account";

export namespace interfaces {
  export type App = appInterface.AppInterface;
  export type ContactAccount = contactAccountInterface.ContactAccountInterface;
  export type Discussion = discussionInterface.DiscussionInterface;
  export namespace Discussion {
    export type GetMessagesOptions = discussionInterface.GetMessagesOptions;
    export type GetParticipantsOptions = discussionInterface.GetParticipantsOptions;
    export type NewMessage = discussionInterface.NewMessage;
  }
  export type DriversStore = driverStoreInterface.DriversStoreInterface;
  export type Message = messageInterface.MessageInterface;
  export type User = userInterface.UserInterface;
  export namespace User {
    export type GetDiscussionsOptions = userInterface.GetDiscussionsOptions;
    export type MessageEvent = userInterface.MessageEvent;
  }
  export type UserAccount = userAccountInterface.UserAccountInterface;
}
