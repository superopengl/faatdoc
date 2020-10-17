import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';


export async function sendNewTaskCreatedEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName } = task;

  await sendEmail({
    to: user.email,
    template: 'taskCreated',
    vars: {
      taskId,
      taskName,
    },
    shouldBcc: true
  });
}
