import * as moment from 'moment';

function formatDate(date) {
  return moment(date).format('DD MMM YYYY');
}

const SIGNATURE_TEXT = `
Kind regards,

--
Admin (on behalf of AU Accounting Office)
https://www.ubcallied.com.au
`;

const SIGNATURE_HTML = `
<p>Kind regards,</p>
<p>
--
<br/>
Admin (on behalf of AU Accounting Office)
<br/>
<a href="https://www.ubcallied.com.au" target="_blank" referrerpolicy="no-referrer">https://www.ubcallied.com.au</a>
</p>
<p>
<img src="https://www.ubcallied.com.au/images/header-logo.jpg" alt="AU Accounting Office Logo" width="auto" height="60px"/>
</p>
`;

export const getForgotPasswordHtmlEmail = (name, url) => `
<p>Dear ${name}</p>

<p>Please click below link to reset your password.</p>
<p><a href="${url}" target="_blank" referrerpolicy="no-referrer">${url}</a></p>

${SIGNATURE_HTML}
`;

export const getForgotPasswordTextEmail = (name, url) => `
Dear ${name}

Please click below link to reset your password.
${url}

${SIGNATURE_TEXT}
`;

export const getSignUpHtmlEmail = (name, url) => `
<p>Dear ${name}</p>
<p>
Welcome to join us.
<br/>
Your Membership eCard information is as below.</p>
<p>You can log in anytime to our website on <a href="${url}" target="_blank" referrerpolicy="no-referrer">${url}</a></p>

${SIGNATURE_HTML}
`;

export const getSignUpTextEmail = (name, url) => `
Dear ${name}

Welcome to join us.

Your Membership eCard information is as below.

You can log in anytime to our website on ${url}

${SIGNATURE_TEXT}
`;

