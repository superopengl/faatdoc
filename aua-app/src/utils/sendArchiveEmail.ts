import { getRepository } from 'typeorm';
import { Job } from '../entity/Job';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';


export async function sendArchiveEmail(job: Job) {
  const user = await getRepository(User).findOne(job.userId);
  const { id: jobId, name: jobName } = job;

  await sendEmail({
    to: user.email,
    template: 'jobArchived',
    vars: {
      jobId,
      jobName,
    },
    shouldBcc: true
  });
}
