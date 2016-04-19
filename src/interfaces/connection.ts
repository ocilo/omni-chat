import {EventEmitter} from "events";

/***************************************************************
 * Connection represents a connection to a certain type of
 * Account. It can establish and maintain a link between you and
 * the Account you want be connected to, but it can also turn it
 * off when you're done. It also allows you to add and remove
 * some events listeners to precise what you want your
 * connection to do.
 ***************************************************************/
export interface Connection extends EventEmitter {
  connected: boolean;     //  The actual state of this connection.
                          //  If it's already connected, it's true,
                          //  and false otherwise.
}
