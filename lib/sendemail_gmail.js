var google = require('googleapis');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
var btoa = require('btoa'); // encode email string to base64
var Handlebars = require('handlebars');
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
function change_alias(alias) {
  var str = alias;
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  ///
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  ///
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
}

module.exports = function sendEmail(options, sendTo, callback) {
  return new Promise((resolve, reject) => {
    var message = options.payload.message || 'message';
    var subject = options.payload.subject || 'subject';
    var credentials = options.auth.credentials; // see:
    oauth2Client.credentials = (credentials.tokens);
    var email = credentials.emails[0].value;
    var name = credentials.name.givenName;
    // console.log(' - - - - - - - - - request.auth.credentials - - - - - - - - - - ');
    // console.log(JSON.stringify(options.auth.credentials));
    var base64EncodedEmail = btoa(unescape(encodeURIComponent(
      "Content-type: text/html;charset=iso-8859-1\r\n" +
      `From: \"${sendTo}\" <${sendTo}>\r\n` +
      `To: \"${sendTo}\" <${sendTo}>\r\n` +
      `Subject: ${change_alias(subject)}\r\n\r\n` +
      `${message}`
    ))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // see: http://stackoverflow.com/questions/30590988/failed-sending-mail-through-google-api-with-javascript
    var params = {
      userId: 'me', auth: oauth2Client, resource: { //  mested object
        raw: base64EncodedEmail
      }
    };
    gmail.users.messages.send(params, () => {
      callback();
      resolve();
    });
  });
}
