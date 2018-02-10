var google       = require('googleapis');
var gmail        = google.gmail('v1');
var OAuth2       = google.auth.OAuth2;
var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
var btoa         = require('btoa'); // encode email string to base64
var Handlebars   = require('handlebars');
/**
 * sendEmail abstracts the complexity of sending an email via the GMail API
 * @param {Object} options - the options for your email, these include:
 *  - credentials
 *    - {Object} auth - the list of tokens returned after Google OAuth
 *    - {Array} emails - the current user's email addresses (List)
 *  - {String} to - the recipient of the email
 *  - {String} from - sender address
 *  - {String} message - the message you want to send
 * @param {Function} callback - gets called once the message has been sent
 *   your callback should accept two arguments:
 *   @arg {Object} error - the error returned by the GMail API
 *   @arg {Object} response - response sent by GMail API
 */
module.exports = function sendEmail(options, sendTo, callback) {
  return new Promise((resolve, reject) => {
    var message  = options.payload.message || 'message';
    var subject = options.payload.subject || 'subject';
    var credentials = options.auth.credentials; // see:
    oauth2Client.credentials = (credentials.tokens);
    var email    = credentials.emails[0].value;
    var name     = credentials.name.givenName;
    // console.log(' - - - - - - - - - request.auth.credentials - - - - - - - - - - ');
    // console.log(JSON.stringify(options.auth.credentials));
    var base64EncodedEmail = btoa(
      `From: \"${sendTo}\" <${sendTo}>\r\n` +
      `To: \"${sendTo}\" <${sendTo}>\r\n` +
      `Subject: ${subject}\r\n` +
      "Content-type: text/html;charset=iso-8859-1\r\n\r\n" +
    
      `${message}`
    ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    // see: http://stackoverflow.com/questions/30590988/failed-sending-mail-through-google-api-with-javascript
    var params = { userId: 'me', auth: oauth2Client, resource: { //  mested object
      raw: base64EncodedEmail
    }};
    gmail.users.messages.send(params, () => {
      callback();
      resolve();
    });
  }); 
}
