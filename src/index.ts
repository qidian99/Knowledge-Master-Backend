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

const url = process.env.MONGO_DEV_URL || 'localhost:4002';

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

app.route('/upload').post((req, res, next) => {
  let fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    console.log(`Uploading: ${filename}`);

    // Path where image will be uploaded
    fstream = createWriteStream(`${__dirname}/files/${filename}`);
    file.pipe(fstream);
    fstream.on('close', () => {
      console.log(`Upload Finished of ${filename}`);
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
