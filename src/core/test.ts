import Promise from 'bluebird';
import * as OChat from './interface';
import {Proxy} from "./interfaces";
import {Account} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";

class FBConnection{
  login:string;
  password:string;

  get(url:string):Promise<string>{
    return Promise.resolve('<html>...</html>');
  }

  constructor(login:string, password:string){
    this.login = login;
    this.password = password;
  }
}

class FBDriver implements Proxy{
  isCompatibleWith(protocol:string):boolean {
    return protocol === 'facebook';
  }



  getContacts(account:Account):Contact[] {
    let credentials = account.data;
    let connection = new FBConnection(credentials.login, credentials.password);

    /*return connection
      .get('/contacts.php')
      .then((page:string) => {
        // parsing;
        let contacts = [];
        //for(...){
        //  contacts.push(new FBContact());
        //}
        return contacts;
      });*/

    return [];
  }

  sendMessage(target:Contact, discussion:Discussion) {
  }

}



/* "Use case" */

// import FBProxy from ...
/*
let client = new OChat.Client();

client.use(new FBDriver());

let user = client.connect(login, pwd, server);
*/







