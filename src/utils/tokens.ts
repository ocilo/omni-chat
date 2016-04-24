import {Token} from "palantiri-interfaces";

export function stringify (token: Token): string {
  return JSON.stringify([token.driver, token.id]);
}

export function parse (tokenString: string): Token {
  let token: any = JSON.parse(tokenString);
  return {driver: token.driver, id: token.id};
}

export function clone (token: Token): Token {
  return {driver: token.driver, id: token.id};
}

export function asString(token: Token | string): string {
  return (typeof token === "string") ? <string> token : stringify(<Token> token);
}

/**
 * Implements a partial ES6 set interface for tokens
 */
export class TokenSet {
  private tokens: string[] = [];
  size: number;

  constructor () {}

  add (token: Token): this {
    if (!this.has(token)) {
      this.tokens.push(asString(token));
      this.size = this.tokens.length;
    }
    return this;
  }

  clear (): void {
    this.tokens = [];
    this.size = 0;
  }

  delete (token: Token): boolean {
    let idx = this.tokens.indexOf(asString(token));
    if (idx < 0) {
      return false;
    }
    this.tokens.splice(idx, 1);
    this.size = this.tokens.length;
    return true;
  }

  has (token: Token): boolean {
    return this.tokens.indexOf(asString(token)) >= 0;
  }

  values (): Token[] {
    return this.tokens.map(parse);
  }
}
