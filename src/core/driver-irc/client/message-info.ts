export enum MessageType{
  NORMAL,
  RESPONSE,
  ERROR,
  RESERVED
}

export interface MessageInfo{
  type: MessageType;
  number: number;
  name: string;
  replyString: string;
}

let numberToCmdInfo: {[number: number]: MessageInfo} = {};
let nameToCmdInfo: {[name: string]: MessageInfo} = {};

export function getCommandInfoByNumber(number: number): MessageInfo{
  if(number in numberToCmdInfo){
    return numberToCmdInfo[number];
  }
  throw new Error(`Unknown replyDescriptor for number ${number}`);
}

export function getCommandInfoByName(name: string): MessageInfo{
  name = name.toUpperCase().trim();
  if(name in nameToCmdInfo){
    return nameToCmdInfo[name];
  }
  throw new Error(`Unknown replyDescriptor for name ${name}`);
}

export function getMessageInfo(command: string): MessageInfo{
  if(/^\d{3}$/.test(command)){
    return getCommandInfoByNumber(parseInt(command, 10));
  }else{
    return getCommandInfoByName(command);
  }
}

function add(type: MessageType, number: number, name: string, replyString: string){
  let descriptor: MessageInfo = {
    type: type,
    number: number,
    name: name,
    replyString: replyString
  };
  if(number !== null){
    numberToCmdInfo[number] = descriptor;
  }
  nameToCmdInfo[name] = descriptor;
}

// normal commands
add(MessageType.NORMAL, null, "NICK", "<newnick>");
add(MessageType.NORMAL, null, "QUIT", "<quitmessage>");
add(MessageType.NORMAL, null, "SQUIT", "<serverquitmessage>");
add(MessageType.NORMAL, null, "INVITE", "<target> <chan>");
add(MessageType.NORMAL, null, "PING", "<timestamp>");
add(MessageType.NORMAL, null, "PONG", "");
add(MessageType.NORMAL, null, "NOTICE", "<target> <text>");
add(MessageType.NORMAL, null, "MODE", "<notice>");
add(MessageType.NORMAL, null, "TOPIC", "");
add(MessageType.NORMAL, null, "JOIN", "");
add(MessageType.NORMAL, null, "PART", "");
add(MessageType.NORMAL, null, "KICK", "");
add(MessageType.NORMAL, null, "KILL", "");
add(MessageType.NORMAL, null, "PRIVMSG", "");
add(MessageType.NORMAL, null, "INVITE", "");
add(MessageType.NORMAL, null, "QUIT", "");

// client-server responses (1-99)
add(MessageType.RESPONSE, 1, "RPL_WELCOME", "Welcome to the Internet Relay Network <nick>!<user>@<host>");
add(MessageType.RESPONSE, 2, "RPL_YOURHOST", "Your host is <servername>, running version <ver>");
add(MessageType.RESPONSE, 3, "RPL_CREATED", "This server was created <date>");
add(MessageType.RESPONSE, 4, "RPL_MYINFO", "<servername> <version> <availableusermodes> <availablechannelmodes>");
add(MessageType.RESPONSE, 5, "RPL_BOUNCE", "Try server <servername>, port <port number>");
// add(MessageType.RESPONSE, 5, "RPL_ISUPPORT", "");

// command responses  (200-399)
add(MessageType.RESPONSE, 302, "RPL_USERHOST", "");
add(MessageType.RESPONSE, 303, "RPL_ISON", "");
add(MessageType.RESPONSE, 301, "RPL_AWAY", "<nick> :<awaymessage>");
add(MessageType.RESPONSE, 305, "RPL_UNAWAY", ":You are no longer marked as being away");
add(MessageType.RESPONSE, 306, "RPL_NOWAWAY", ":You have been marked as being away");
add(MessageType.RESPONSE, 311, "RPL_WHOISUSER", "<nick> <user> <host> * :<realname>");
add(MessageType.RESPONSE, 312, "RPL_WHOISSERVER", "<nick> <server> :<serverinfo>");
add(MessageType.RESPONSE, 313, "RPL_WHOISOPERATOR", "<nick> :is an IRC operator");
add(MessageType.RESPONSE, 317, "RPL_WHOISIDLE", "<nick> <integer> :seconds idle");
add(MessageType.RESPONSE, 318, "RPL_ENDOFWHOIS", "<nick> :End of WHOIS list");
add(MessageType.RESPONSE, 318, "RPL_ENDOFWHOIS", "<nick> :End of WHOIS list");
add(MessageType.RESPONSE, 319, "RPL_WHOISCHANNELS", "");
add(MessageType.RESPONSE, 314, "RPL_WHOWASUSER", "<nick> <user> <host> * :<real name>");
add(MessageType.RESPONSE, 369, "RPL_ENDOFWHOWAS", "<nick> :End of WHOWAS");
add(MessageType.RESPONSE, 321, "RPL_LISTSTART", "");  // Obsolete
add(MessageType.RESPONSE, 322, "RPL_LIST", "<channel> <#visible> :<topic>");
add(MessageType.RESPONSE, 323, "RPL_LISTEND", ":End of LIST");
add(MessageType.RESPONSE, 325, "RPL_UNIQOPIS", "<channel> <nickname>");
add(MessageType.RESPONSE, 324, "RPL_CHANNELMODEIS", "<channel> <mode> <modeparams>");
add(MessageType.RESPONSE, 331, "RPL_NOTOPIC", "<channel> :No topic is set");
add(MessageType.RESPONSE, 332, "RPL_TOPIC", "<channel> :<topic>");
add(MessageType.RESPONSE, 341, "RPL_INVITING", "<channel> <nick>");
add(MessageType.RESPONSE, 342, "RPL_SUMMONING", "<user> :Summoning user to IRC");
add(MessageType.RESPONSE, 346, "RPL_INVITELIST", "<channel> <invitemask>");
add(MessageType.RESPONSE, 347, "RPL_ENDOFINVITELIST", "<channel> :End of channel invite list");
add(MessageType.RESPONSE, 348, "RPL_EXCEPTLIST", "<channel> <exceptionmask>");
add(MessageType.RESPONSE, 349, "RPL_ENDOFEXCEPTLIST", "<channel> :End of channel exception list");
add(MessageType.RESPONSE, 351, "RPL_VERSION", "<version>.<debuglevel> <server> :<comments>");
add(MessageType.RESPONSE, 352, "RPL_WHOREPLY", "");
add(MessageType.RESPONSE, 315, "RPL_ENDOFWHO", "<name> :End of WHO list");
add(MessageType.RESPONSE, 353, "RPL_NAMREPLY", "");
add(MessageType.RESPONSE, 366, "RPL_ENDOFNAMES", "<channel> :End of NAMES list");
add(MessageType.RESPONSE, 364, "RPL_LINKS", "<mask> <server> :<hopcount> <serverinfo>");
add(MessageType.RESPONSE, 365, "RPL_ENDOFLINKS", "<mask> :End of LINKS list");
add(MessageType.RESPONSE, 367, "RPL_BANLIST", "<channel> <banmask>");
add(MessageType.RESPONSE, 368, "RPL_ENDOFBANLIST", "<channel> :End of channel ban list");
add(MessageType.RESPONSE, 371, "RPL_INFO", ":<string>");
add(MessageType.RESPONSE, 374, "RPL_ENDOFINFO", ":End of INFO list");
add(MessageType.RESPONSE, 375, "RPL_MOTDSTART", ":- <server> Message of the day - ");
add(MessageType.RESPONSE, 372, "RPL_MOTD", ":- <text>");
add(MessageType.RESPONSE, 376, "RPL_ENDOFMOTD", ":End of MOTD command");
add(MessageType.RESPONSE, 381, "RPL_YOUREOPER", ":You are now an IRC operator");
add(MessageType.RESPONSE, 382, "RPL_REHASHING", "<config file> :Rehashing");
add(MessageType.RESPONSE, 383, "RPL_YOURESERVICE", "You are service <servicename>");
add(MessageType.RESPONSE, 391, "RPL_TIME", "<server> :<serverlocaltime>");
add(MessageType.RESPONSE, 392, "RPL_USERSSTART", ":UserID   Terminal  Host");
add(MessageType.RESPONSE, 393, "RPL_USERS", ":<username> <ttyline> <hostname>");
add(MessageType.RESPONSE, 394, "RPL_ENDOFUSERS", ":End of users");
add(MessageType.RESPONSE, 395, "RPL_NOUSERS", ":Nobody logged in");
add(MessageType.RESPONSE, 200, "RPL_TRACELINK", "Link <versiondebuglevel> <destination> <nextserver> V<protocolversion> <linkuptimeinseconds> <backstreamsendq> <upstreamsendq>");
add(MessageType.RESPONSE, 201, "RPL_TRACECONNECTING", "Try. <class> <server>");
add(MessageType.RESPONSE, 202, "RPL_TRACEHANDSHAKE", "H.S. <class> <server>");
add(MessageType.RESPONSE, 203, "RPL_TRACEUNKNOWN", "");
add(MessageType.RESPONSE, 204, "RPL_TRACEOPERATOR", "Oper <class> <nick>");
add(MessageType.RESPONSE, 205, "RPL_TRACEUSER", "User <class> <nick>");
add(MessageType.RESPONSE, 206, "RPL_TRACESERVER", "");
add(MessageType.RESPONSE, 207, "RPL_TRACESERVICE", "Service <class> <name> <type> <activetype>");
add(MessageType.RESPONSE, 208, "RPL_TRACENEWTYPE", "<newtype> 0 <clientname>");
add(MessageType.RESPONSE, 209, "RPL_TRACECLASS", "Class <class> <count>");
add(MessageType.RESPONSE, 210, "RPL_TRACERECONNECT", ""); // Obsolete
add(MessageType.RESPONSE, 261, "RPL_TRACELOG", "File <logfile> <debuglevel>");
add(MessageType.RESPONSE, 262, "RPL_TRACEEND", "<servername> <versiondebuglevel> :End of TRACE");
add(MessageType.RESPONSE, 211, "RPL_STATSLINKINFO", "<linkname> <sendq> <sentmessages> <sentkbytes> <receivedmessages> <receivedkbytes> <timeopen>");
add(MessageType.RESPONSE, 212, "RPL_STATSCOMMANDS", "<command> <count> <bytecount> <remotecount>");
add(MessageType.RESPONSE, 219, "RPL_ENDOFSTATS", "<statsletter> :End of STATS report");
add(MessageType.RESPONSE, 242, "RPL_STATSUPTIME", "");
add(MessageType.RESPONSE, 243, "RPL_STATSOLINE", "O <hostmask> * <name>");
add(MessageType.RESPONSE, 221, "RPL_UMODEIS", "<usermodestring>");
add(MessageType.RESPONSE, 234, "RPL_SERVLIST", "<name> <server> <mask> <type> <hopcount> <info>");
add(MessageType.RESPONSE, 235, "RPL_SERVLISTEND", "<mask> <type> :End of service listing");
add(MessageType.RESPONSE, 251, "RPL_LUSERCLIENT", ":There are <integer> users and <integer> services on <integer> servers");
add(MessageType.RESPONSE, 252, "RPL_LUSEROP", "<integer> :operator(s) online");
add(MessageType.RESPONSE, 253, "RPL_LUSERUNKNOWN", "<integer> :unknown connection(s)");
add(MessageType.RESPONSE, 254, "RPL_LUSERCHANNELS", "<integer> :channels formed");
add(MessageType.RESPONSE, 255, "RPL_LUSERME", ":I have <integer> clients and <integer> servers");
add(MessageType.RESPONSE, 256, "RPL_ADMINME", "<server> :Administrative info");
add(MessageType.RESPONSE, 257, "RPL_ADMINLOC1", ":<admin info>");
add(MessageType.RESPONSE, 258, "RPL_ADMINLOC2", ":<admin info>");
add(MessageType.RESPONSE, 259, "RPL_ADMINEMAIL", ":<admin info>");
add(MessageType.RESPONSE, 263, "RPL_TRYAGAIN", "<command> :Please wait a while and try again.");

// command responses  (400-599)
add(MessageType.ERROR, 401, "ERR_NOSUCHNICK", "<nickname> :No such nick/channel");
add(MessageType.ERROR, 402, "ERR_NOSUCHSERVER", "<servername> :No such server");
add(MessageType.ERROR, 403, "ERR_NOSUCHCHANNEL", "<channelname> :No such channel");
add(MessageType.ERROR, 404, "ERR_CANNOTSENDTOCHAN", "<channelname> :Cannot send to channel");
add(MessageType.ERROR, 405, "ERR_TOOMANYCHANNELS", "<channelname> :You have joined too many channels");
add(MessageType.ERROR, 406, "ERR_WASNOSUCHNICK", "<nickname> :There was no such nickname");
add(MessageType.ERROR, 407, "ERR_TOOMANYTARGETS", "<target> :<error code> recipients. <abortmessage>");
add(MessageType.ERROR, 408, "ERR_NOSUCHSERVICE", "<servicename> :No such service");
add(MessageType.ERROR, 409, "ERR_NOORIGIN", ":No origin specified");
add(MessageType.ERROR, 411, "ERR_NORECIPIENT", ":No recipient given (<command>)");
add(MessageType.ERROR, 412, "ERR_NOTEXTTOSEND", ":No text to send");
add(MessageType.ERROR, 413, "ERR_NOTOPLEVEL", "<mask> :No toplevel domain specified");
add(MessageType.ERROR, 414, "ERR_WILDTOPLEVEL", "<mask> :Wildcard in toplevel domain");
add(MessageType.ERROR, 415, "ERR_BADMASK", "<mask> :Bad Server/host mask");
add(MessageType.ERROR, 421, "ERR_UNKNOWNCOMMAND", "<command> :Unknown command");
add(MessageType.ERROR, 422, "ERR_NOMOTD", ":MOTD File is missing");
add(MessageType.ERROR, 423, "ERR_NOADMININFO", "<server> :No administrative info available");
add(MessageType.ERROR, 424, "ERR_FILEERROR", ":File error doing <file op> on <file>");
add(MessageType.ERROR, 431, "ERR_NONICKNAMEGIVEN", ":No nickname given");
add(MessageType.ERROR, 432, "ERR_ERRONEUSNICKNAME", "<nick> :Erroneous nickname");
add(MessageType.ERROR, 433, "ERR_NICKNAMEINUSE", "<nick> :Nickname is already in use");
add(MessageType.ERROR, 436, "ERR_NICKCOLLISION", "<nick> :Nickname collision KILL from <user>@<host>");
add(MessageType.ERROR, 437, "ERR_UNAVAILRESOURCE", "<nickchannel> :Nick/channel is temporarily unavailable");
add(MessageType.ERROR, 441, "ERR_USERNOTINCHANNEL", "<nick> <channel> :They aren't on that channel");
add(MessageType.ERROR, 442, "ERR_NOTONCHANNEL", "<channel> :You're not on that channel");
add(MessageType.ERROR, 443, "ERR_USERONCHANNEL", "<user> <channel> :is already on channel");
add(MessageType.ERROR, 444, "ERR_NOLOGIN", "<user> :User not logged in");
add(MessageType.ERROR, 445, "ERR_SUMMONDISABLED", ":SUMMON has been disabled");
add(MessageType.ERROR, 446, "ERR_USERSDISABLED", ":USERS has been disabled");
add(MessageType.ERROR, 451, "ERR_NOTREGISTERED", ":You have not registered");
add(MessageType.ERROR, 461, "ERR_NEEDMOREPARAMS", "<command> :Not enough parameters");
add(MessageType.ERROR, 462, "ERR_ALREADYREGISTRED", ":Unauthorized command (already registered)");
add(MessageType.ERROR, 463, "ERR_NOPERMFORHOST", ":Your host isn't among the privileged");
add(MessageType.ERROR, 464, "ERR_PASSWDMISMATCH", ":Password incorrect");
add(MessageType.ERROR, 465, "ERR_YOUREBANNEDCREEP", ":You are banned from this server");
add(MessageType.ERROR, 466, "ERR_YOUWILLBEBANNED", "");
add(MessageType.ERROR, 467, "ERR_KEYSET", "<channel> :Channel key already set");
add(MessageType.ERROR, 471, "ERR_CHANNELISFULL", "<channel> :Cannot join channel (+l)");
add(MessageType.ERROR, 472, "ERR_UNKNOWNMODE", "<char> :is unknown mode char to me for <channel>");
add(MessageType.ERROR, 473, "ERR_INVITEONLYCHAN", "<channel> :Cannot join channel (+i)");
add(MessageType.ERROR, 474, "ERR_BANNEDFROMCHAN", "<channel> :Cannot join channel (+b)");
add(MessageType.ERROR, 475, "ERR_BADCHANNELKEY", "<channel> :Cannot join channel (+k)");
add(MessageType.ERROR, 476, "ERR_BADCHANMASK", "<channel> :Bad Channel Mask");
add(MessageType.ERROR, 477, "ERR_NOCHANMODES", "<channel> :Channel doesn't support modes");
add(MessageType.ERROR, 478, "ERR_BANLISTFULL", "<channel> <char> :Channel list is full");
add(MessageType.ERROR, 481, "ERR_NOPRIVILEGES", ":Permission Denied- You're not an IRC operator");
add(MessageType.ERROR, 482, "ERR_CHANOPRIVSNEEDED", "<channel> :You're not channel operator");
add(MessageType.ERROR, 483, "ERR_CANTKILLSERVER", ":You can't kill a server!");
add(MessageType.ERROR, 484, "ERR_RESTRICTED", ":Your connection is restricted!");
add(MessageType.ERROR, 485, "ERR_UNIQOPPRIVSNEEDED", ":You're not the original channel operator");
add(MessageType.ERROR, 491, "ERR_NOOPERHOST", ":No O-lines for your host");
add(MessageType.ERROR, 501, "ERR_UMODEUNKNOWNFLAG", ":Unknown MODE flag");
add(MessageType.ERROR, 502, "ERR_USERSDONTMATCH", ":Cannot change mode for other users");

// reserved
add(MessageType.RESERVED, 231, "RPL_SERVICEINFO", "");
add(MessageType.RESERVED, 232, "RPL_SERVICEINFO", "");
add(MessageType.RESERVED, 233, "RPL_SERVICE", "");
add(MessageType.RESERVED, 300, "RPL_NONE", "");
add(MessageType.RESERVED, 316, "RPL_WHOISCHANOP", "");
add(MessageType.RESERVED, 361, "RPL_KILLDONE", "");
add(MessageType.RESERVED, 362, "RPL_CLOSING", "");
add(MessageType.RESERVED, 363, "RPL_CLOSEEND", "");
add(MessageType.RESERVED, 373, "RPL_INFOSTART", "");
add(MessageType.RESERVED, 384, "RPL_MYPORTIS", "");
add(MessageType.RESERVED, 213, "RPL_STATSCLINE", "");
add(MessageType.RESERVED, 214, "RPL_STATSNLINE", "");
add(MessageType.RESERVED, 215, "RPL_STATSILINE", "");
add(MessageType.RESERVED, 216, "RPL_STATSKLINE", "");
add(MessageType.RESERVED, 217, "RPL_STATSQLINE", "");
add(MessageType.RESERVED, 218, "RPL_STATSYLINE", "");
add(MessageType.RESERVED, 240, "RPL_STATSVLINE", "");
add(MessageType.RESERVED, 241, "RPL_STATSLLINE", "");
add(MessageType.RESERVED, 244, "RPL_STATSHLINE", "");
add(MessageType.RESERVED, 245, "RPL_STATSSLINE", ""); // The spec defines 244 twice
add(MessageType.RESERVED, 246, "RPL_STATSPING", "");
add(MessageType.RESERVED, 247, "RPL_STATSBLINE", "");
add(MessageType.RESERVED, 250, "RPL_STATSDLINE", "");
add(MessageType.RESERVED, 492, "ERR_NOSERVICEHOST", "");














