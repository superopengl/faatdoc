import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as templates from './emailTemplates';
import * as _ from 'lodash';
import * as sanitizeHtml from 'sanitize-html';
import * as nodemailer from 'nodemailer';
import { Email } from 'email-templates';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    awsConfig();
    transporter = nodemailer.createTransport({
      SES: new aws.SES({ apiVersion: '2010-12-01' })
    });
  }
  return transporter;
}

export async function sendJobCompleteEmail(job) {
  const tran = getTransporter();

  await tran.sendMail({
    from: 'accountant@auao.com.au',
    to: 'mr.shaojun@gmail.com',
    subject: 'Hello {{user}}',
    text: 'hello {{user}}',
    html: '<b>hello{{user}}</b>',
    attachments: [
      {
        filename: 'Director regins letter.pdf',
        path: 'https://auao-portal-upload.s3.ap-southeast-2.amazonaws.com/dev/31802242-7cb3-4fd1-b7f0-90f2406374de/Director%20resign%20letter.pdf'
      }
    ]
  });
}

export class EmailRequest {
  to: string;
  vars: object;
  templateName: string;
  shouldBcc?: boolean = false;
}

function sanitizeVars(vars) {
  const sanitized = {};
  Object.entries(vars).forEach(([k, v]) => sanitized[k] = _.isString(v) ? sanitizeHtml(v) : v);
  return sanitized;
}

export async function sendEmail(req: EmailRequest) {
  assert(req.to, 400, 'Email recipient is not specified');
  const template = templates[req.templateName];
  assert(template, 404, `Email template '${req.templateName}' is not found`);

  const body = template.body(sanitizeVars(req.vars));
  awsConfig();

  const ses = new aws.SES({ apiVersion: '2010-12-01' });

  const params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [req.to],
      BccAddresses: req.shouldBcc ? ['accountant@auao.com.au'] : []
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        },
        // Text: {
        //   Charset: 'UTF-8',
        //   Data: body
        // }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: template.subject
      }
    },
    Source: 'AU Accounting Office <accountant@auao.com.au>',
    ReplyToAddresses: ['AU Accounting Office <accountant@auao.com.au>'],
  };

  const sesRequest = ses.sendEmail(params).promise();
  await sesRequest;
}