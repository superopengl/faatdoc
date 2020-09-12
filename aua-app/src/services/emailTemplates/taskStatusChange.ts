import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'Task Status Changed',
  body: _.template(`
<p>Dear client</p>
<p>The status of your task <%= name %> changed.
Please log into <a href="https://www.auao.com.au" target="_blank" rel="noreferrer noopener">https://www.auao.com.au</a> for the details.</p>
${signature}
`)
};

export default template;