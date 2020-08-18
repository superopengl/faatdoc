import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';

export class EmailRequest {
  to: string;
  subject?: string;
  textBody: string;
  htmlBody: string;
  shouldBcc = false;
}

export async function sendEmail(req: EmailRequest) {
  assert(req.to, 500, 'Email recipient is not specified');

  awsConfig();

  const ses = new aws.SES({ apiVersion: '2010-12-01' });

  const params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [req.to],
      BccAddresses: req.shouldBcc ? ['office.aua.allied@gmail.com'] : []
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: req.htmlBody
        },
        Text: {
          Charset: 'UTF-8',
          Data: req.textBody
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `${req.subject || 'AUA Allied Notification'}`
      }
    },
    Source: 'AUA Allied <office.aua.allied@gmail.com>',
    ReplyToAddresses: ['AUA Allied <office.aua.allied@gmail.com>'],
  };

  const sesRequest = ses.sendEmail(params).promise();
  await sesRequest;
}