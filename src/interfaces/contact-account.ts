/***************************************************************
 * UserAccount represente one account used by a Contact of one
 * user of Omni-Chat. This is just an username associated with
 * a protocol through which the user can send messages.
 * ContactAccount is totally DIFFERENT from UserAccount. An user
 * can not acceed to his contacts accounts. All he wants is to
 * send messages to them, so all he needs to know is how to
 * identify them and how to communicate with them.
 ***************************************************************/
export interface ContactAccount {
  contactName: string;  //  Le nom sous lequel se fait connaitre
                        //  le contact.

  protocol: string;     //  Le protocole associe a ce compte.

  localID: number;      //  L'identifiant du contact.
                        //  Ceci depend directement de la base
                        //  et donc du protocol utilise.
}
