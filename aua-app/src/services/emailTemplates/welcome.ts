import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'Welcome to AU Accouting Office',
  body: _.template(`
<p>Dear client</p>
<p>Thank you very much for signing up AU Accounting Office!</p>
${signature}
`)
};

export default template;