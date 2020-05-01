/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
require('dotenv').config();
import express, { urlencoded, json } from 'express';
import { model, connect } from 'mongoose';

import { ApolloServer } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-errors';

import busboy from 'connect-busboy'; // middleware for form/file upload
import { join } from 'path'; // used for file path
import { createWriteStream } from 'fs-extra'; // File System - for file manipulation
import './models'; // require before resolvers to register the schemas
import { User } from './models/user';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import cors from './middlewares/cors';
import errorHandler from './middlewares/errorHandler';
import { getUser, injectAdminUser, injectTopics } from './util';
import './wechat';
const url = process.env.MONGO_DEV_URL || 'localhost:4002';

// 临时密钥服务例子
import bodyParser from 'body-parser';
const STS = require('qcloud-cos-sts');
import crypto from 'crypto';
import pathLib from 'path';
import fs from 'fs';

// 配置参数
const config = {
  secretId: process.env.QCLOUD_SECRET_ID,
  secretKey: process.env.QCLOUD_SECRET_KEY,
  // proxy: process.env.Proxy,
  // proxy: '',
  proxy: null,
  durationSeconds: 1800,
  bucket: process.env.QCLOUD_BUCKET,
  region: process.env.QCLOUD_REGION,
  // 允许操作（上传）的对象前缀，可以根据自己网站的用户登录态判断允许上传的目录，例子： user1/* 或者 * 或者a.jpg
  // 请注意当使用 * 时，可能存在安全风险，详情请参阅：https://cloud.tencent.com/document/product/436/40265
  allowPrefix: 'km/*',
  // 密钥的权限列表
  allowActions: [
    // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
    // 简单上传
    'name/cos:PutObject',
    'name/cos:PostObject',
    'name/cos:DeleteObject',
    // 分片上传
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
  ]
};

const app = express();
app.use(busboy());
// app.use(express.static(join(__dirname, 'public')));
console.log(join(__dirname + 'public'));
app.use(
  urlencoded({
    extended: true
  })
);
app.use(json());
app.use(cors);

app.use(errorHandler);

// 格式一：临时密钥接口
app.all('/sts', function (req, res, next) {
  // TODO 这里根据自己业务需要做好放行判断
  // if (config.allowPrefix === '_ALLOW_DIR_/*') {
  //   res.send({ error: '请修改 allowPrefix 配置项，指定允许上传的路径前缀' });
  //   return;
  // }

  if (!config.bucket) return;
  // 获取临时密钥
  const LongBucketName = config.bucket;
  const ShortBucketName = LongBucketName.substr(
    0,
    LongBucketName.lastIndexOf('-')
  );
  const AppId = LongBucketName.substr(LongBucketName.lastIndexOf('-') + 1);
  const policy = {
    version: '2.0',
    statement: [
      {
        action: config.allowActions,
        effect: 'allow',
        resource: [
          'qcs::cos:' +
            config.region +
            ':uid/' +
            AppId +
            ':prefix//' +
            AppId +
            '/' +
            ShortBucketName +
            '/' +
            config.allowPrefix
        ]
      }
    ]
  };
  const startTime = Math.round(Date.now() / 1000);
  STS.getCredential(
    {
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      region: config.region,
      durationSeconds: config.durationSeconds,
      policy: policy
    },
    function (err: any, tempKeys: any) {
      if (tempKeys) tempKeys.startTime = startTime;
      console.log(tempKeys);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'origin,accept,content-type'
      );
      res.send(err || tempKeys);
    }
  );
});

app.route('/upload').post((req, res, next) => {
  let fstream;
  if (!req.busboy) {
    res.send({
      status: 422,
      message: 'No files are attached'
    });
    return;
  }
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    console.log(`Uploading: ${filename}`, file);

    // Path where image will be uploaded
    fstream = createWriteStream(`${__dirname}/files/${filename}`);
    file.pipe(fstream);
    fstream.on('close', () => {
      console.log(`Upload Finished of ${filename}`);
      res.send({
        status: 200,
        message: 'Successfully uploaded file: ' + filename
      });
      // TODO: enable this line when wired up with FE!
      // res.redirect('back');           //where to go next
    });
  });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({
    req
  }): Promise<{
    // user?: { email: string; id: string; roles: Array<string> };
    user?: any;
  }> => {
    // console.log('Header JWT:', req.headers.authorizationoken);
    const tokenWithBearer = req.headers.authorization || '';
    const splittedToken = tokenWithBearer.split(' ');
    // console.log('Header JWT:', splittedToken);
    if (splittedToken.length <= 1) {
      return {
        user: null
      };
    }
    const token = splittedToken[1];
    const u = getUser(token);
    // console.log('returned jwt decode', u);
    if (!u) {
      return {
        user: null
      };
    }
    if (u) {
      let userObject;
      if (u.email) {
        userObject = await User.findOne()
          .or([{ openid: u.openid }, { email: u.email }])
          .populate('subscription');
      } else {
        userObject = await User.findOne({
          openid: u.openid
        }).populate('subscription');
      }
      // return many null
      // const userObject = await User.find()
      //   .or([{ openid: u.openid }, { email: u.email }])
      //   .populate('subscription');

      if (userObject) {
        // console.log('Returned user context', userObject);
        return {
          user: userObject
          // : {
          //   email: userObject.email,
          //   id: userObject._id,
          //   openid: userObject.openid,
          //   roles: userObject.roles
          // }
        };
      }
      return {
        user: null
      };
    }
    return {
      user: null
    };
  },
  formatError: (err): any => {
    console.log(err);
    return new Error(err.message);
  },
  plugins: [
    {
      requestDidStart(): any {
        // console.log('request started!');

        return {
          didEncounterErrors(context: any): Error {
            // console.log(context)
            const { response, errors } = context;
            let msg;
            if (
              errors.find((err: any) => {
                const unauthorized =
                  err.originalError instanceof AuthenticationError;
                if (unauthorized) msg = err.message;
                return unauthorized;
              })
            ) {
              // response.data = undefined
              // console.log('status', response.http)
              if (response && response.http) {
                response.http.status = 401;
              }
              throw new Error(msg);
              // response.http.headers.set('Has-Errors', '1');
              // console.log(response, errors)
            } else {
              throw new Error('Unknown error');
            }
          },

          willSendResponse(context: any): any {
            // console.log('will send response', context);
          }
        };
      },

      async serverWillStart(): Promise<void> {
        console.log('Server starting!');
        await injectTopics();
        await injectAdminUser();
      }
    }
  ]
});

server.applyMiddleware({
  app
});

const port = process.env.PORT || 4002;

app.listen(
  {
    port
  },
  () =>
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    )
);

connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((err: Error): void => console.log(err));
