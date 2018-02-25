require('env2')('.env');
var assert = require('assert');
var path = require('path');
var Hapi = require('hapi'); // require the hapi module
// var server = new Hapi.Server({ debug: { request: ['error'] } }); // debug!
const dataFolder = './data/';
const fs = require('fs');
const readline = require('readline');
var server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: Number(process.env.PORT) // defined by environment variable or .env file
});

var scopes = [
  'https://www.googleapis.com/auth/plus.profile.emails.read',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];
console.log(scopes);

var opts = {
  REDIRECT_URL: '/googleauth',  // must match google app redirect URI
  handler: require('./lib/google_oauth_handler.js'), // your handler
  scope: scopes // profile
};

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
// var gcal = google.calendar('v3'); // http://git.io/vBGLn
var gmail = google.gmail('v1');
var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, opts.REDIRECT_URL);
var btoa = require('btoa');

var hapi_auth_google = require('hapi-auth-google');
var sendEmail = require('../lib/sendemail_gmail');

var plugins = [
  { register: hapi_auth_google, options: opts },
  require('hapi-auth-jwt2'),
  require('vision')
];
server.register(plugins, function (err) {
  // handle the error if the plugin failed to load:
  assert(!err, "FAILED TO LOAD PLUGIN!!! :-("); // fatal error
  // see: http://hapijs.com/api#serverauthschemename-scheme
  server.auth.strategy('jwt', 'jwt', true,
    {
      key: process.env.JWT_SECRET,
      validateFunc: require('./lib/hapi_auth_jwt2_validate.js'),
      verifyOptions: { ignoreExpiration: true }
    });
  var views = path.resolve(__dirname + '/views/');
  console.log('views path:', views);
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: views,
    path: '.',
    layout: 'layout',
  });

  server.route([{
    method: 'GET',
    path: '/',
    config: { auth: false },
    handler: function (request, reply) {
      var url = server.generate_google_oauth2_url();
      var imgsrc = 'https://developers.google.com/accounts/images/sign-in-with-google.png';
      var btn = '<a href="' + url + '"><img src="' + imgsrc + '" alt="Login With Google"></a>'
      reply(btn);
    }
  },
  {
    method: '*',
    path: '/sendemail',
    config: { auth: 'jwt' },
    handler: function (request, reply) {
      if (!request.payload) {
        // reply('Payload is require');
        reply.redirect('/');
        return;
      }
      if (!request.payload.filename) {
        reply('Filename is require');
        return;
      } else {
        const filename = request.payload.filename;
        const path = dataFolder + filename;
        var rd = readline.createInterface({
          input: fs.createReadStream(path),
          output: false,
          console: false
        });
        let _mails= [], mails = [];
        const tasks = [];
        rd.on('line', function (line) {
          _mails.push(line);
        });
        rd.on('close', () => {
          function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
          }

          // usage example:
          var mails = _mails.filter(onlyUnique);
          for (let mail of mails) {
            tasks.push(sendEmail(request, mail, (err, response) => {
              if (err) {
                console.log(err);
                return;
              }
              console.log(`Send to ${mail} succsess`);
            }));
          }
          Promise.all(tasks).then(() => {
            console.log('Finish');
            reply(`Success <a href="http://localhost:8000/compose">click here </a>to Send new email`);
          });
        });
      }
    }
  },
  {
    method: '*',
    path: '/compose',
    config: { auth: false },
    handler: function (request, reply) {
      fs.readdir(dataFolder, (err, files) => {
        if (err) {
          reply('Read file has error');
          return;
        }
        reply.view('compose', { files });
        return;
      })
    }
  }
  ]);
});

server.start(function (err) { // boots your server
  console.log(' - - - - - - - - - - - -  Hapi Server Version: ' + server.version);
  // console.log(err)
  // console.log(' - - - - - - - - - - - - - - - - - -');
  assert(!err, "FAILED TO Start Server", err);
  console.log('Now Visit: http://localhost:' + server.info.port);
});

module.exports = server;
