import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'Task Notification',
  body: _.template(`
<p>Dear client</p>
<p>There is a notification for your task change in AU Accouting Office.
Please log into <a href="https://www.auao.com.au" target="_blank" rel="noreferrer noopener">https://www.auao.com.au</a> for the details.</p>
${signature}
`)
};

export default template;