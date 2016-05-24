import {MessageInterface} from "./message";

export interface EventObject {
	type: string;
}

export interface MessageEventObject extends EventObject {
	type: "message";
	message: MessageInterface;
}
