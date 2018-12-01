const { api }  = require('./api');
const { host, portal } = require('./config');
const URL = 'user-service/account/password/'+portal;

module.exports = {
  helpIntent: (conv) => {
    const email_reset = conv.parameters.email_reset;
    return api.post(`${host}/${URL}/${email_reset}`).then(() => {
      conv.ask('The instruction has been sent to your email ' + email_reset);
    })
    .catch(err => {
      conv.ask('Oops! Are you sure email is correct!');
    });
  },
}
