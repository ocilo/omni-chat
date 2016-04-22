/**
 * Created by Ruben on 22/04/2016.
 */
import {Discussion} from "palantiri-interfaces";

/***************************************************************
 * GroupChat represents a mono-protocol and mono-account
 * Discussion. This allows us to keep the aspect of "group chat"
 * in the side of the protocol used by Palantiri.
 * The type alias prevent some misunderstandings.
 ***************************************************************/
export type GroupChat = Discussion;

/***************************************************************
 * Subdiscussion represents a mono-protocol and mono-account
 * discussion involved in a multi-accounts and multi-protocols
 * Discussion. The attribute "since" allows us to correctly get
 * the messages from this discussions without losing the
 * meaning of the Discussion.
 ***************************************************************/
export type Subdiscussion = Array<{since: Date, discussion: GroupChat}>;