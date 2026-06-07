const cipher = [
  { in: /a/g, out: ['#t', '#j'] },
  { in: /e/g, out: ['#x', '#p'] },
  { in: /i/g, out: ['#f', '#w'] },
  { in: /o/g, out: ['#l', '#8'] },
  { in: /u/g, out: ['#7', '#0'] },
  { in: /=/g, out: ['#g', '#v'] }
] as const;

class Encoder {
  private value: string;

  constructor(value = '') {
    this.value = value;
  }

  base64() {
    this.value = Buffer.from(this.value).toString('base64');
    return this;
  }

  cipher(step: 0 | 1) {
    this.value = cipher.reduce((acc, curr) => acc.replace(curr.in, curr.out[step]), this.value);
    return this;
  }

  reverse() {
    this.value = this.value.split('').reverse().join('');
    return this;
  }

  timestamp() {
    const date = new Date().toISOString().split(/-|T|:/);
    this.value = `${date[0]}${date[1]}${date[2]}sofse`;
    return this;
  }

  url() {
    this.value = encodeURIComponent(this.value);
    return this;
  }

  toString() {
    return this.value;
  }
}

function generateUsername() {
  return new Encoder().timestamp().base64().toString();
}

function encodePassword(value: string) {
  return new Encoder(value).base64().cipher(0).reverse().base64().cipher(1).reverse().url().toString();
}

export function generateCredentials() {
  const username = generateUsername();
  const password = encodePassword(username);
  return { username, password };
}
