import { getRepository } from 'typeorm';
import { Job } from '../entity/Job';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { File } from '../entity/File';


export async function sendCompletedEmail(job: Job) {
  const user = await getRepository(User).findOne(job.userId);
  const { id: jobId, docs: jobDocs, name: jobName } = job;
  const fileIds = (jobDocs || []).filter(d => d.isFeedback).map(d => d.fileId).filter(x => x);
  const attachments = fileIds.length ?
    await getRepository(File)
      .createQueryBuilder('x')
      .where(`x.id IN (:...ids)`, { ids: fileIds })
      .select(['x.fileName as filename', 'x.location as path'])
      .execute() :
    undefined;

  await sendEmail({
    to: user.email,
    template: 'jobComplete',
    vars: {
      jobId,
      jobName,
    },
    attachments,
    shouldBcc: true
  });
}
