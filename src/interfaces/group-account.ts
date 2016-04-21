import {ContactAccount} from "./contact-account";
import * as Bluebird from "bluebird";

/***************************************************************
 * GroupAccount represents an aggregation of several
 * ContactAccounts. This allows us to send a message to an
 * existant discussion group instead of sending it to each
 * member separatly, losing the idea of "group" in the
 * contact's side.
 * Note that the field "protocol" of each ContactAccount in
 * members must be the same that the field "protocol" of
 * this object, to avoid errors later.
 ***************************************************************/
export interface GroupAccount {
  protocol: string;           //  Le protocole associe a ces comptes.

  members: ContactAccount[];  //  La liste de tous les membres du
                              //  groupe de discussion.

  localDiscussionID: number;  //  L'identifiant de la conversation,
                              //  s'il existe. Depend directement
                              //  de la base et donc du protocole utilise.

  addMembers(members: ContactAccount[], callback?: (err: Error, members: ContactAccount[]) => any): Bluebird.Thenable<GroupAccount>;
  //  Add all the ContactAccounts "members" to the list of
  //  known members.
  //  Note that the ContactAccount with the field "protocol"
  //  different of the field "protocol" of the current object
  //  will not be added. The same applies to accounts already
  //  existing in members.
  //  If at least one account can not be added, err will not
  //  be null.
}
