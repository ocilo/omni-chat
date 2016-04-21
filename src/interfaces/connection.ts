import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import {ConnectedApi} from "./connected-api";
import {UserAccount} from "./user-account";

/***************************************************************
 * Connection represents a connection to a certain type of
 * UserAccount. It can establish and maintain a link between
 * you and the UserAccount you want be connected to, but it can
 * also turn it off when you're done. It also allows you to add
 * and remove some events listeners to precise what you want
 * your connection to do.
 * Since it is specific to a certain type of Account, when devs
 * create a new module, they must develop an new Connection too.
 ***************************************************************/
export interface Connection extends EventEmitter {
  connected: boolean;         //  The actual state of this connection.
                              //  If it's already connected, it's true,
                              //  and false otherwise.

  connectedApi: ConnectedApi; //  The api provided by this connection.
                              //  The connection needs to be established,
                              //  otherwise this field will be null.

  connect(userAccount: UserAccount): Bluebird.Thenable<ConnectedApi>;
  //  Try to establich a connection to the account "userAccount".
  //  If it succeed, it will then return a ConnectApi which allows
  //  you to do some operations with the account, this.connected
  //  will be true and this.connectedApi will not be null anymore.
  //  If the current Connection was already on, it will first
  //  disconnect it.

  disconnect(): Bluebird.Thenable<Connection>;
  //  If the current Connection was already established, it turns
  //  it off, set this.connected to false and this.connectedApi
  //  to null.
  //  Otherwise, it does nothing.

  getConnectedApi(): Bluebird.Thenable<ConnectedApi>;
  //  Return the ConnectedApi for the current Connection.
  //  Note that if the current Connection is not yet
  //  established, it will return a null object.
}
