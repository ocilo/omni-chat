// Implementation of https://tools.ietf.org/html/rfc2812

import * as net from "net";
import * as tls from "tls";
import * as events from "events";

import * as _ from "lodash";
import * as Promise from "bluebird";
import {parseMessage} from "./helpers";
import {Message} from "./helpers";

export interface PartialClientOptions{
  server: string,
  nick: string,
  password?: string,
  userName?: string,
  realName?: string,
  port?: number,
  localAddress?: string,
  debug?: boolean,
  showErrors?: boolean,
  autoRejoin?: boolean,
  autoConnect?: boolean,
  channels?: string[],
  retryCount?: number,
  retryDelay?: number,
  secure?: boolean,
  selfSigned?: boolean,
  certExpired?: boolean,
  floodProtection?: boolean,
  floodProtectionDelay?: number,
  sasl?: boolean,
  stripColors?: boolean,
  channelPrefixes?: string,
  messageSplit?: number,
  encoding?: string,
  webirc?: {
    pass?: string,
    ip?: string,
    host?: string
  }
}

export interface ClientOptions extends PartialClientOptions{
  server: string,
  nick: string,
  password: string,
  userName: string,
  realName: string,
  port: number,
  localAddress: string,
  debug: boolean,
  showErrors: boolean,
  autoRejoin: boolean,
  autoConnect: boolean,
  channels: string[],
  retryCount: number,
  retryDelay: number,
  secure: boolean,
  selfSigned: boolean,
  certExpired: boolean,
  floodProtection: boolean,
  floodProtectionDelay: number,
  sasl: boolean,
  stripColors: boolean,
  channelPrefixes: string,
  messageSplit: number,
  encoding: string,
  webirc: {
    pass: string,
    ip: string,
    host: string
  }
}

let defaultOptions: ClientOptions = {
  server: null,
  nick: null,
  password: null,
  userName: 'ochat',
  realName: 'ochat node IRC client',
  port: 6667,
  localAddress: null,
  debug: false,
  showErrors: false,
  autoRejoin: false,
  autoConnect: true,
  channels: [],
  retryCount: null,
  retryDelay: 2000,
  secure: false,
  selfSigned: false,
  certExpired: false,
  floodProtection: false,
  floodProtectionDelay: 1000,
  sasl: false,
  stripColors: false,
  channelPrefixes: '&#',
  messageSplit: 512,
  encoding: "utf8",
  webirc: {
    pass: '',
    ip: '',
    host: ''
  }
};

export interface ServerSupport{
  channel: {
    idlength: {[chanPrefix: string]: number}, // ex: {"&": 15, "#": 10},
    length: number,
    limit: {[chanPrefix: string]: number}, // ex: {"&": 10, "#": 20}
    modes: { a: string, b: string, c: string, d: string},
    types: string
  },
  kicklength: number,
  maxlist: {[mode: string]: number},
  maxtargets: {[commandType: string]: number},
  modes: number,
  nicklength: number,
  topiclength: number,
  usermodes: string
}

let defaultServerSupport: ServerSupport = {
  channel: {
    idlength: {},
      length: 200,
      limit: {},
      modes: { a: '', b: '', c: '', d: ''},
    types: "&#"
  },
  kicklength: 0,
  maxlist: {},
  maxtargets: {},
  modes: 3,
  nicklength: 9,
  topiclength: 0,
  usermodes: ''
};

export interface ChanData{
  name: string,
  key: string,
  serverName: string,
  users: {[nick: string]: any},
  modeParams: {[nick: string]: any},
  mode: string,
  topic: string,
  topicBy?: string, // nick of the person who set the topic
  created?: string
}

export interface createConnectionOptions{
  port: number,
  host?: string,
  localAddress? : string,
  localPort? : string,
  family? : number,
  allowHalfOpen?: boolean,
}

export interface WhoisData{
  [key: string]: string
  nick: string,
  away?: string,
  user?: string,
  host?: string,
  realname?: string,
  idle?: string,
  channels?: string,
  server?: string,
  serverInfo?: string,
  operator?: string,
  account?: string,
  accountInfo?: string
}

export interface ClientState{
  connecting: boolean,
  connected: boolean,
  requestedDisconnect: boolean,
  nick: string,
  motd: string, // message of the day
  whoisData: {[nick: string]: WhoisData}
}

let defaultClientState: ClientState = {
  connecting: false,
  connected: false,
  requestedDisconnect: false,
  nick: null,
  motd: "",
  whoisData: {}
};

export class ClientIRC extends events.EventEmitter{
  options: ClientOptions;
  serverSupport: ServerSupport;
  state: ClientState;
  chans: {[name: string]: ChanData} = {};
  connection: net.Socket;
  inputBuffer: Buffer;

  constructor(options: PartialClientOptions){
    super();
    this.options = _.merge({}, defaultOptions, options);
    if(!this.options.server){
      throw new Error("Missing server in options");
    }
    if(!this.options.nick){
      throw new Error("Missing nick in options");
    }
    this.serverSupport = _.clone(defaultServerSupport);
    this.state = _.clone(defaultClientState);
  }

  getChanData(chan: string, createIfMissing: boolean = true): ChanData{
    return this.chans[chan];
  }

  setWhoisData(nick: string, key: "nick"|"away"|"user"|"host"|"realname"|"idle"|"channels"|"server"|"serverinfo"|"operator", value: any): void {
    if(!(nick in this.state.whoisData)){
      this.state.whoisData[nick] = {nick: nick};
    }
    this.state.whoisData[nick][key] = value;
  }

  deleteWhoisData(nick: string): WhoisData{
    this.setWhoisData(nick, "nick", nick);
    let data: WhoisData = this.state.whoisData[nick];
    delete this.state.whoisData[nick];
    return data;
  }

  send (command: string, args: string[]) {
    let parts = [command];
    for(let i = 0; i<args.length; i++){
      parts.push(args[i]);
    }

    // escape last part
    let lastIdx = parts.length - 1;
    let lastPart = parts[lastIdx];
    if(/\s/.test(lastPart) || /^:/.test(lastPart) || lastPart === "") {
      parts[lastIdx] = `:${lastPart}`;
    }

    let line = `${parts.join(" ")}\r\n`;

    console.log(">> "+line.substring(0, line.length-2));
    this.connection.write(line);
  }

  private resetState(): void{
    // TODO: disconnect
    this.state.connecting = false;
    this.state.connected = false;
    this.state.requestedDisconnect = false;
    this.state.nick = this.options.nick;
    this.state.motd = "";
    this.inputBuffer = new Buffer("");
    this.chans = {};
  }

  private promisifyEvents = function(successEvents: string[], failureEvents: string[]): Promise<any>{
    return new Promise((resolve, reject) => {
      let listeners:{onSuccess?: () => any, onFailure?: (err: Error) => any} = {};
      let removeListeners = () => {
        for(let i = 0, l = successEvents.length; i < l; i++){
          this.removeListener(successEvents[i], listeners.onSuccess);
        }
        for(let i = 0, l = failureEvents.length; i < l; i++){
          this.removeListener(failureEvents[i], listeners.onFailure);
          let eventName = failureEvents[i];
        }
      };
      listeners.onSuccess = () => {
        removeListeners();
        resolve();
      };
      listeners.onFailure = (err: Error) => {
        removeListeners();
        reject(err);
      };
      for(let i = 0, l = successEvents.length; i < l; i++){
        this.on(successEvents[i], listeners.onSuccess);
      }
      for(let i = 0, l = failureEvents.length; i < l; i++){
        this.on(failureEvents[i], listeners.onFailure);
      }
    });
  };

  connect (retryCount: number = 0): Promise<any> {
    if(this.state.connected) {
      return Promise.resolve();
    }

    if(this.state.connecting){
      return this.promisifyEvents(["registered"], ["error"]);
    }

    this.state.connecting = true;

    return Promise.try(() => {
      this.resetState();

      let connectionOpts: createConnectionOptions = {
        host: this.options.server,
        port: this.options.port
      };
      if (this.options.localAddress){
        connectionOpts.localAddress = this.options.localAddress;
      }

      // TODO(Charles): close previous connection
      this.connection = net.createConnection(connectionOpts, () => {
        this.send("NICK", [this.options.nick]);
        this.send("USER", [this.options.userName, "8", '*', this.options.realName]);
        this.once("registered", () => {
          this.state.connecting = false;
          this.state.connected = true;
          // update maxLength()
        });
      });

      this.connection.setEncoding(this.options.encoding);

      this.connection.on("data", (chunk: Buffer) => {
        if(!(chunk instanceof Buffer)) {
          chunk = new Buffer(chunk);
        }
        this.inputBuffer = Buffer.concat([this.inputBuffer, chunk]);
        this.processBuffer();
      });

      this.connection.on("end", () => {
        if(this.state.connecting) {
          let err = new Error("Unexpected socket end");
          this.emit("error", err);
          this.emit("error.net", err);
        }
      });

      this.connection.on("close", () => {
        if(this.state.connected) {
          if(this.state.requestedDisconnect){
            return;
          } else {
            // auto-reconnect
          }
        } else if(this.state.connecting) {
          // retry connection
        } else {
          // UNDEFINED BEHAVIOUR
        }
        //setTimeout(() => {
        //  this.connect(retryCount + 1);
        //}, this.options.retryDelay);
      });

      this.connection.on("error", (error: Error) => {
        this.emit("error", error);
        this.emit("error.net", error);
      });

      return this.promisifyEvents(["registered"], ["error"]);
    });
  };

  private processBuffer(){
    let content: string = this.inputBuffer.toString();
    let lines: string[] = content.split(/\r\n|\r|\n/);

    // We ignore the last line because it is either "" or an incomplete line
    for(let i = 0, l = lines.length - 1; i < l; i++){
      let line = lines[i];
      let command = parseMessage(line);
      this.handle(command);
    }

    this.inputBuffer = new Buffer(lines[lines.length-1]);
  }

  private removeUserFromChan(nick: string, chan: string) {
    if (nick == this.state.nick) {
      let channel = this.getChanData(chan);
      delete this.chans[channel.key]; // TODO(Charles): normalize to name ?
    } else {
      let channel = this.getChanData(chan);
      if (channel && channel.users) {
        delete channel.users[nick];
      }
    }
  }

  handle(message: Message): void{
    this.emit("message", message);
    console.log("<< "+message.raw);

    switch(message.name){
      case "RPL_WELCOME":
        this.state.nick = message.args[0];
        this.emit("registered");
        // TODO(Charles): handle welcome string and host mask
        break;
      case 'RPL_MYINFO':
        this.serverSupport.usermodes = message.args[3];
        break;
      case 'RPL_ISUPPORT':
        this.handleRPL_ISUPPORT(message);
        break;
      case 'RPL_YOURHOST':
      case 'RPL_CREATED':
      case 'RPL_LUSERCLIENT':
      case 'RPL_LUSEROP':
      case 'RPL_LUSERCHANNELS':
      case 'RPL_LUSERME':
      case 'RPL_LOCALUSERS':
      case 'RPL_GLOBALUSERS':
      case 'RPL_STATSCONN':
      case 'RPL_LUSERUNKNOWN':
        // Various welcome messages
        break;
      case 'PING':
        this.send('PONG', [message.args[0]]);
        break;
      case 'PONG':
        break;
      case 'NOTICE':
        this.handleNOTICE(message);
        break;
      case "MODE":
        this.handleMODE(message);
        break;
      case "NICK":
        // the user just changed their own nick
        if (message.nick == this.state.nick) {
          this.state.nick = message.args[0];
          // self._updateMaxLineLength();
        }
        // TODO(Charles): propagate change to other channels
        break;
      case 'RPL_MOTDSTART':
        this.state.motd = message.args[1] + '\n';
        break;
      case 'RPL_MOTD':
        this.state.motd += message.args[1] + '\n';
        break;
      case 'RPL_ENDOFMOTD':
        this.state.motd += message.args[1] + '\n';
        // self.emit('motd', self.motd);
        break;
      case 'ERR_NOMOTD':
        break;
      case 'RPL_NAMREPLY':
        this.handleRPL_NAMEREPLY(message);
        break;
      case 'RPL_ENDOFNAMES':
        this.handleRPL_ENDOFNAMES(message);
        break;
      case 'RPL_TOPIC':
        this.handleRPL_TOPIC(message);
        break;
      case 'RPL_AWAY':
        this.setWhoisData(message.args[1], "away", message.args[2]);
        break;
      case 'RPL_WHOISUSER':
        this.setWhoisData(message.args[1], 'user', message.args[2]);
        this.setWhoisData(message.args[1], 'host', message.args[3]);
        this.setWhoisData(message.args[1], 'realname', message.args[5]);
        break;
      case 'RPL_WHOISIDLE':
        this.setWhoisData(message.args[1], 'idle', message.args[2]);
        break;
      case 'RPL_WHOISCHANNELS':
        // TODO - clean this up?
        this.setWhoisData(message.args[1], 'channels', message.args[2].trim().split(/\s+/));
        break;
      case 'RPL_WHOISSERVER':
        this.setWhoisData(message.args[1], 'server', message.args[2]);
        this.setWhoisData(message.args[1], 'serverinfo', message.args[3]);
        break;
      case 'RPL_WHOISOPERATOR':
        this.setWhoisData(message.args[1], 'operator', message.args[2]);
        break;
      case 'RPL_ENDOFWHOIS':
        // this.emit('whois', this.deleteWhoisData(command.args[1]));
        break;
      case 'RPL_WHOREPLY':
        this.setWhoisData(message.args[5], 'user', message.args[2]);
        this.setWhoisData(message.args[5], 'host', message.args[3]);
        this.setWhoisData(message.args[5], 'server', message.args[4]);
        this.setWhoisData(message.args[5], 'realname', /[0-9]+\s*(.+)/g.exec(message.args[7])[1]);
        // emit right away because rpl_endofwho doesn't contain nick
        this.emit('whois', this.deleteWhoisData(message.args[5]));
        break;
      case 'RPL_LISTSTART':
        // this.state.channellist = [];
        // self.emit('channellist_start');
        break;
      case 'RPL_LIST':
        this.handleRPL_LIST(message);
        break;
      case 'RPL_LISTEND':
        // self.emit('channellist', self.channellist);
        break;
      case 'RPL_TOPICWHOTIME':
        this.handleRPL_TOPICWHOTIME(message);
        break;
      case 'TOPIC':
        this.handleTOPIC(message);
        break;
      case 'RPL_CHANNELMODEIS':
        this.handleRPL_CHANNELMODEIS(message);
        break;
      case 'RPL_CREATIONTIME':
        this.handleRPL_CREATIONTIME(message);
        break;
      case 'JOIN':
        // channel, who
        if (this.state.nick === message.nick) {
          this.getChanData(message.args[0], true);
        } else {
          let channel: ChanData = this.getChanData(message.args[0]);
          if (channel && channel.users) {
            channel.users[message.nick] = '';
          }
        }
        //self.emit('join', command.args[0], command.nick, command);
        //self.emit('join' + command.args[0], command.nick, command);
        //if (command.args[0] != command.args[0].toLowerCase()) {
        //  self.emit('join' + command.args[0].toLowerCase(), command.nick, command);
        //}
        break;
      case 'PART':
        // channel, who, reason
        // self.emit('part', command.args[0], command.nick, command.args[1], command);
        // self.emit('part' + command.args[0], command.nick, command.args[1], command);
        if (message.args[0] != message.args[0].toLowerCase()) {
          // self.emit('part' + command.args[0].toLowerCase(), command.nick, command.args[1], command);
        }
        this.removeUserFromChan(message.nick, message.args[0]);
        break;
      case 'KICK':
        // channel, who, by, reason
        // self.emit('kick', command.args[0], command.args[1], command.nick, command.args[2], command);
        // self.emit('kick' + command.args[0], command.args[1], command.nick, command.args[2], command);
        //if (message.args[0] != message.args[0].toLowerCase()) {
        //  this.emit('kick' + message.args[0].toLowerCase(), message.args[1], message.nick, message.args[2], message);
        //}
        this.removeUserFromChan(message.args[1], message.args[0]);
        break;
      case 'KILL':
        this.handleKILL(message);
        break;
      case 'PRIVMSG':
        this.handlePRIVMSG(message);
        break;
      case 'INVITE':
        this.handleINVITE(message);
        break;
      case 'QUIT':
        this.handleQUIT(message);
        break;
    }
  }

  // http://www.irc.org/tech_docs/draft-brocklesby-irc-isupport-03.txt
  private handleRPL_ISUPPORT(command: Message): void{
    for(let i = 0, l = command.args.length; i < l; i++){
      let arg = command.args[i];
      let match: string[] = <string[]>arg.match(/([A-Z]+)=(.*)/);
      if(!match){
        continue;
      }
      let paramName = match[1];
      let value = match[2];
      switch(paramName){
        case "CHANLIMIT":
          value.split(",").forEach((part: string) => {
            let parts: string[] = part.split(":");
            this.serverSupport.channel.limit[parts[0]] = parseInt(parts[1], 10);
          });
          break;
        case "CHANMODES":
          let values:string[] = value.split(",");
          let types = "abcd";
          this.serverSupport.channel.modes.a += parseInt(values[0] || "0", 10);
          this.serverSupport.channel.modes.b += parseInt(values[1] || "0", 10);
          this.serverSupport.channel.modes.c += parseInt(values[2] || "0", 10);
          this.serverSupport.channel.modes.d += parseInt(values[3] || "0", 10);
          break;
        case "CHANTYPES":
          this.serverSupport.channel.types = value;
          break;
        case "CHANNELEN":
          this.serverSupport.channel.length = parseInt(value, 10);
          break;
        case "IDCHAN":
          value.split(",").forEach((part: string) => {
            let parts: string[] = part.split(":");
            this.serverSupport.channel.idlength[parts[0]] = parseInt(parts[1], 10);
          });
          break;
        case "KICKLEN":
          this.serverSupport.kicklength = parseInt(value, 10);
          break;
        case "MAXLIST":
          value.split(",").forEach((part: string) => {
            let parts: string[] = part.split(":");
            this.serverSupport.maxlist[parts[0]] = parseInt(parts[1], 10);
          });
          break;
        case "NICKLEN":
          this.serverSupport.nicklength = parseInt(value, 10);
          break;
        case "PREFIX":
          match = <string[]>value.match(/\((.*?)\)(.*)/);
          if (match) {
            /*match[1] = match[1].split('');
            match[2] = match[2].split('');
            while (match[1].length) {
              self.modeForPrefix[match[2][0]] = match[1][0];
              self.supported.channel.modes.b += match[1][0];
              self.prefixForMode[match[1].shift()] = match[2].shift();
            }*/
          }
          break;
        case "TARGMAX":
          value.split(',').forEach((part: string) => {
            let parts: string[] = part.split(":");
            this.serverSupport.channel.idlength[parts[0]] = parseInt(parts[1] || "0", 10);
          });
          break;
        case "TOPICLEN":
          this.serverSupport.topiclength = parseInt(value, 10);
          break;
        case "STATUSMSG":
        default:
          break;
      }
    }
  }

  private handleNOTICE(message: Message): void {
    let from: string = message.nick;
    let to: string = message.args[0] || null;
    let text: string = message.args[1] || "";

    // TODO(Charles): handle Client To Client Protocol
    //if (text[0] === '\u0001' && text.lastIndexOf('\u0001') > 0) {
    //  self._handleCTCP(from, to, text, 'notice', message);
    //}
  }

  private handleMODE(message: Message): void{
  }

  private handleRPL_NAMEREPLY(message: Message): void{
    let channel = this.getChanData(message.args[2]);
    var users = message.args[3].trim().split(/ +/);
    if (channel) {
      users.forEach(function(user) {
        var match = user.match(/^(.)(.*)$/);
        if (match) {
          //if (match[1] in self.modeForPrefix) {
          //  channel.users[match[2]] = match[1];
          //}
          //else {
          //  channel.users[match[1] + match[2]] = '';
          //}
        }
      });
    }
  }

  private handleRPL_ENDOFNAMES(message: Message): void {
    let chanName = message.args[1];
    let channel = this.getChanData(chanName);
    if (channel) {
      //this.emit('names', chanName, channel.users);
      //self.send('MODE', chanName);
    }
  }

  private handleRPL_TOPIC(message: Message): void {
    let channel = this.getChanData(message.args[1]);
    if (channel) {
      channel.topic = message.args[2];
    }
  }

  private handleRPL_LIST(message: Message): void {
    let channel = {
      name: message.args[1],
      users: message.args[2],
      topic: message.args[3]
    };
    // self.emit('channellist_item', channel);
    // this.state.channellist.channellist.push(channel);
  }

  private handleRPL_TOPICWHOTIME(message: Message): void {
    let channel: ChanData = this.getChanData(message.args[1]);
    //if (channel) {
    //  channel.topicBy = command.args[2];
    //  // channel, topic, nick
    //  self.emit('topic', command.args[1], channel.topic, channel.topicBy, command);
    //}
  }

  private handleTOPIC(message: Message): void {
    // channel, topic, nick
    // self.emit('topic', command.args[0], command.args[1], command.nick, command);
    let channel:ChanData = this.getChanData(message.args[0]);
    if (channel) {
      channel.topic = message.args[1];
      channel.topicBy = message.nick;
    }
  }

  private handleRPL_CHANNELMODEIS(message: Message): void {
    let channel: ChanData = this.getChanData(message.args[1]);
    if (channel) {
      channel.mode = message.args[2];
    }
  }

  private handleRPL_CREATIONTIME(message: Message): void {
    let channel: ChanData = this.getChanData(message.args[1]);
    if (channel) {
      channel.created = message.args[2];
    }
  }

  private handleKILL(message: Message): void {
    let nick = message.args[0];
    let channels: string[] = [];
    for(let chanName in this.chans) {
      this.removeUserFromChan(nick, chanName);
      channels.push(chanName);
    }
    // self.emit('kill', nick, command.args[1], channels, command);
  }

  private handlePRIVMSG(message: Message): void {
    let from = message.nick;
    let to = message.args[0];
    let text = message.args[1] || "";
    /*if (text[0] === '\u0001' && text.lastIndexOf('\u0001') > 0) {
     self._handleCTCP(from, to, text, 'privmsg', command);
     break;
     }
     self.emit('command', from, to, text, command);
     if (self.supported.channel.types.indexOf(to.charAt(0)) !== -1) {
     self.emit('command#', from, to, text, command);
     self.emit('command' + to, from, text, command);
     if (to != to.toLowerCase()) {
     self.emit('command' + to.toLowerCase(), from, text, command);
     }
     }*/
    if (to.toUpperCase() === this.state.nick.toUpperCase()){
      this.emit('pm', from, text, message);
    }
  }

  private handleINVITE(message: Message): void {
    let from = message.nick;
    let to = message.args[0];
    let channel = message.args[1];
    // this.emit('invite', channel, from, command);
  }

  private handleQUIT(message: Message): void {
    if (this.state.nick == message.nick) {
      // TODO handle?
      return;
    }
    // handle other people quitting

    let channels: string[] = [];

    // TODO better way of finding what channels a user is in?
    Object.keys(this.chans).forEach(function(channame) {
      var channel = this.chans[channame];
      delete channel.users[message.nick];
      channels.push(channame);
    });

    // who, reason, channels
    // self.emit('quit', command.nick, command.args[0], channels, command);
  }
}
































