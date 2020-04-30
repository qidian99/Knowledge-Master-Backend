/* eslint-disable @typescript-eslint/camelcase */
import fetch, { Headers, RequestInit } from 'node-fetch';

const formatDate = (date: number): string => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return year + '年' + month + '月' + day + '日';
};

class WechatManager {
  accessToken = '';
  expiresIn: number;
  constructor() {
    this.expiresIn = Date.now();
  }
  async requestAccessToken(): Promise<any> {
    const grantType = 'client_credential';

    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    const appid = process.env.APP_ID;
    const appSecret = process.env.APP_SECRET;

    if (!appid || !appSecret) throw new Error('Invalid register code input');

    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grantType}&appid=${appid}&secret=${appSecret}`,
      requestOptions
    );
    console.log(res);

    const data = await res.json();
    console.log(data);

    this.accessToken = data.access_token;
    this.expiresIn = Date.now() + parseInt(data.expires_in) * 1000;
    console.log(this.accessToken, this.expiresIn);
  }
  async sendTemplate(
    openid: string,
    postId = '5eaa83653d1fbc9ace812943'
  ): Promise<any> {
    if (!openid) {
      return;
    }
    // check for access token
    if (this.expiresIn < Date.now()) {
      await this.requestAccessToken();
    }
    console.log('before sending template', this.accessToken, this.expiresIn);
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${this.accessToken}`;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const body: any = {
      touser: openid,
      template_id: '8gB9PBxb7bXmeTAGr97VAqbUFVDH8PGp5HbBaWD__eU',
      page: `/pages/dev/main?postId=${postId}`,
      miniprogram_state: process.env.PROD === '0' ? 'development' : 'trial',
      data: {
        phrase1: {
          value: '管理员'
        },
        phrase2: {
          value: '你的新评论'
        },
        time3: {
          value: formatDate(Date.now())
        }
      }
    };

    console.log('Template request body', JSON.stringify(body));

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(body)
    };

    const res = await fetch(url, requestOptions);
    console.log(res);

    const data = await res.json();
    console.log(data);
  }
}

const wechatManager = new WechatManager();
export default wechatManager;
