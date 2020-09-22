import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'Job Notification',
  body: _.template(`
<p>Dear client</p>
<p>There is a notification for your job change in AU Accouting Office.
Please log into <a href="${process.env.AUA_DOMAIN_NAME}" target="_blank" rel="noreferrer noopener">${process.env.AUA_DOMAIN_NAME}</a> for the details.</p>
${signature}
`)
};

export default template;