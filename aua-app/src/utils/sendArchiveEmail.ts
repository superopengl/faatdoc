import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';


export async function sendArchiveEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName, forWhom } = task;

  await sendEmail({
    to: user.email,
    template: 'taskArchived',
    vars: {
      forWhom,
      taskId,
      taskName,
    },
    shouldBcc: true
  });
}
