import { getRepository } from 'typeorm';
import { Job } from '../entity/Job';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';


export async function sendRequireSignEmail(job: Job) {
  const user = await getRepository(User).findOne(job.userId);
  const { id: jobId, name: jobName } = job;

  await sendEmail({
    to: user.email,
    template: 'jobToSign',
    vars: {
      jobId,
      jobName,
    },
    shouldBcc: true
  });
}
