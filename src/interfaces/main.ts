export {App} from "./app";
export {Connection} from "./connection";
export {Contact} from "./contact";
export {ContactAccount} from "./contact-account";
export {Discussion} from "./discussion";
export {DiscussionAuthorization} from "./discussion-authorization";
export {GroupAccount} from "./group-account";
export {Message, MessageFlags} from "./message";
export {ConnectedApi} from "./connected-api";
export {User} from "./user";
export {UserAccount} from "./user-account";

import * as utils from "./utils";

export namespace utils {
  export type Dictionary<T> = utils.Dictionary<T>;
  export type NumericDictionary<T> = utils.NumericDictionary<T>;
  export type Document = utils.Document;
}
