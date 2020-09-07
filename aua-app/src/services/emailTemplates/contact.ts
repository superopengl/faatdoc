import signature from './emailSignature';
import * as _ from 'lodash';

const template = {
  subject: 'New Contact from AU Accouting Office Portal',
  body: _.template(`
<p  style="white-space: pre-line">
<%=message%>
</p>
<p>--</p>
<p>
<strong>From : </strong><%= name %>
<br/>
<strong>Company : </strong><%= company %>
<br/>
<strong>Contact : </strong><%= contact %>
</p>
`)
};

export default template;