export class Chan{
  serverName: string;
  name: string;
  users: {[nick: string]: any};
  topic: string = "";
  topicAuthor: string = null;
  mode: string = "";
  key: string;
  modeParams: {[nick: string]: any};
  created: string;
}
