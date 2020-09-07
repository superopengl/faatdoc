import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'Reset Password',
  body: _.template(`
<p>Dear client</p>
<p>Please click below link to reset password.</p>
<%= url %>
${signature}
`)
};

export default template;