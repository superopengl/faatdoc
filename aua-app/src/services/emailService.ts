import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as templates from './emailTemplates';
import * as _ from 'lodash';

export class EmailRequest {
  to: string;
  vars: object;
  templateName: string;
  shouldBcc = false;
}

export async function sendEmail(req: EmailRequest) {
  assert(req.to, 400, 'Email recipient is not specified');
  const template = templates[req.templateName];
  assert(template, 404, `Email template '${req.templateName}' is not found`);

  const body = template.body(req.vars);
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

  // TODO: Turn on email sending
  // const sesRequest = ses.sendEmail(params).promise();
  // await sesRequest;
}