/**
 * Created by Ruben on 20/04/2016.
 */

/***************************************************************
 * Standard events are constants representing the basic events
 * supported by the library.
 * You can use them when you want to handle an event, so you
 * won't be listening for several events names which in fact
 * all are the same one.
 ***************************************************************/
export const EVENT_MSG_RCV : string = "msgReceived";
export const EVENT_MSG_SND : string = "msgSent";
export const EVENT_CONTACT_REQUEST : string = "contactRequest";
export const EVENT_DISCUSS_NAME_CHANGED : string = "discussionNameChange";