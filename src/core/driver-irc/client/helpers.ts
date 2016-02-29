import * as _ from "lodash";
import * as Promise from "bluebird";
import {MessageType, MessageInfo, getMessageInfo} from "./message-info";

export interface Message{
  raw: string,
  name: string,
  type: MessageType,
  args: string[],
  prefix: string
  nick: string,
  user: string,
  host: string
  server: string,
  stringValue: string
}


// Return the lower cased version of the nickname as described in the IRC spec
// https://tools.ietf.org/html/rfc2812#section-2.2
export function getLowerCaseNick(nick: string): string {
  return nick
    .toLowerCase()
    .replace("[", "{")
    .replace("]", "}")
    .replace("|", "\\")
    .replace("^", "~");
}

let defaultMessage: Message = {
  raw: "",
  name: null,
  type: null,
  args: [],
  prefix: null,
  nick: null,
  user: null,
  host: null,
  server: null,
  stringValue: ""
};

export function parseMessage(line: string): Message{
  let command:Message = _.clone(defaultMessage);
  command.raw = line;

  let match: string[];

  // Parse prefix
  match = <string[]>line.match(/^:([^ ]+) +/);
  if (match) {
    command.prefix = match[1];
    line = line.substring(match[0].length);
    match = <string[]>command.prefix.match(/^([_a-zA-Z0-9\~\[\]\\`^{}|-]*)(?:!([^@]+)@(.*))?$/);
    if (match) {
      command.nick = match[1];
      command.user = match[2];
      command.host = match[3];
    } else {
      command.server = command.prefix;
    }
  }

  // Parse command
  match = <string[]>line.match(/^([^ ]+) */);

  let commandPart: string = match[1];
  let commandDescriptor: MessageInfo = getMessageInfo(commandPart);

  command.name = commandDescriptor.name;
  command.type = commandDescriptor.type;

  line = line.substring(match[0].length);

  let middle: string, trailing: string;

  // Parse parameters
  if (line.search(/^:|\s+:/) != -1) {
    match = <string[]>line.match(/(.*?)(?:^:|\s+:)(.*)/);
    middle = match[1].trim();
    trailing = match[2];
  }
  else {
    middle = line;
    trailing = "";
  }

  if (middle.length){
    command.args = middle.split(/ +/);
  } else {
    command.args = [];
  }


  if (trailing.length){
    command.args.push(trailing)
  }

  return command;
}

export interface DeferredPromise<T>{
  promise: Promise<T>,
  resolve: (result: T) => any,
  reject: (err: Error) => any
}

export function getDeferredPromise<T>(): DeferredPromise<T>{
  let deferred: DeferredPromise<T> = {
    promise: null,
    resolve: null,
    reject: null
  };

  deferred.promise = new Promise((resolve: (result: T) => any, reject: (error: Error) => any) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}
