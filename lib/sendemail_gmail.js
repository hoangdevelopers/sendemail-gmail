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
module.exports = function sendEmail(options, callback) {
  var template = Handlebars.compile(options.payload.message);
  var message  = template(options.payload);
  console.log(message);
  var credentials = options.auth.credentials; // see:
  oauth2Client.credentials = (credentials.tokens);
  var email    = credentials.emails[0].value;
  var name     = credentials.name.givenName;
  // console.log(' - - - - - - - - - request.auth.credentials - - - - - - - - - - ');
  // console.log(JSON.stringify(options.auth.credentials));
  var base64EncodedEmail = btoa(
    "From: \"Stanley Toles\" <hoang.nguyenduc@nccsoft.vn>\r\n" +
    "To: \"Stanley Toles\" <hoang.nguyenduc@nccsoft.vn>\r\n" +
    "Subject: this would be the subject\r\n" +
    "Content-type: text/html;charset=iso-8859-1\r\n\r\n" +
  
    `<div class="mt-signature" contenteditable="false" g_editable="false">
    <a href="https://mailtrack.io/" class="mt-signature-logo" style="text-decoration:none;" data-mt-detrack-inspected="true"><img src="https://s3-eu-west-1.amazonaws.com/mailtrack-crx/icon-signature.png" "width="16" height="14" g_editable="false"></a>
    <font style="color:#999;">Sent with <a href="https://chrome.google.com/webstore/detail/mailtrack-for-gmail-inbox/ndnaehgpjlnokgebbaldlmgkapkpjkkb?utm_source=gmail&amp;utm_medium=signature&amp;utm_campaign=signaturevirality" class="mt-install" data-mt-detrack-inspected="true">Mailtrack</a></font>
    
<div class="mt-tool-tracking">
    <div title="Remove the Mailtrack signature" class="mt-remove">
        <span data-remove-text="REMOVE"></span>
    </div>
</div>
</div>`
  ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // see: http://stackoverflow.com/questions/30590988/failed-sending-mail-through-google-api-with-javascript
  var params = { userId: 'me', auth: oauth2Client, resource: { //  mested object
    raw: base64EncodedEmail
  }};
  console.log(Object.keys(gmail.google))
  return gmail.users.messages.send(params, callback);
}
