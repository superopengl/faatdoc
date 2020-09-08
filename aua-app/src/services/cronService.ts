import { getRepository } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { CronJob } from 'cron';
import { SysLog } from '../entity/SysLog';
import { generateLodgementByJobTemplateAndPortofolio } from '../utils/generateLodgementByJobTemplateAndPortofolio';
import { assert } from '../utils/assert';
import { v4 as uuidv4 } from 'uuid';
import { LodgementStatus } from '../enums/LodgementStatus';
import { Lodgement } from '../entity/Lodgement';
import errorToJSON from 'error-to-json';
import * as cronParser from 'cron-parser';
import * as moment from 'moment';
import { getUtcNow } from '../utils/getUtcNow';

const startImmidiatly = true;
const tz = 'Australia/Sydney';
const runningJobs = [];

function stopRunningJobs() {
  let job;
  while ((job = runningJobs.shift())) {
    job.stop();
  }
}

async function startRecurrings() {
  console.log('Restarting cron service');
  const repo = getRepository(Recurring);
  const list = await repo.find({});

  stopRunningJobs();
  const jobs = list.map(r => startSingleRecurring(r));
  runningJobs.push(...jobs);
  console.log('Restarted cron service');
}

function logging(log: SysLog) {
  getRepository(SysLog).save(log).catch(() => { });
}

function trySetLodgementDueDateField(lodgement, dueDay) {
  if (!dueDay) return;
  const dueDateField = lodgement.fields.find(x => x.name === 'dueDate');
  if (!dueDateField) return;
  dueDateField.value = moment().add(dueDay, 'day').toDate();
}

function generateLodgementNameFromTemplate(nameTemplate) {
  return nameTemplate;
}

export async function executeRecurring(recurringId) {
  assert(recurringId, 400);
  const recurring = await getRepository(Recurring).findOne({ id: recurringId });
  assert(recurring, 404);
  const { jobTemplateId, portofolioId, nameTemplate } = recurring;

  const lodgement = await generateLodgementByJobTemplateAndPortofolio(
    jobTemplateId,
    portofolioId,
    (j, p) => `Test`
  );

  const lodgementId = uuidv4();
  lodgement.name = generateLodgementNameFromTemplate(nameTemplate);
  lodgement.id = lodgementId;
  lodgement.status = LodgementStatus.SUBMITTED;

  trySetLodgementDueDateField(lodgement, recurring.dueDay);

  await getRepository(Lodgement).save(lodgement);

  return lodgement;
}


function startSingleRecurring(recurring: Recurring): CronJob {
  const { id, cron, jobTemplateId, portofolioId } = recurring;
  const job = new CronJob(
    cron,
    async () => {
      const lodgement = await executeRecurring(id);

      const log = new SysLog();
      log.level = 'info';
      log.message = 'Recurring complete';
      log.data = {
        recurringId: id,
        jobTemplateId,
        portofolioId,
        createdLodgementId: lodgement.id
      };

      logging(log);
    },
    null,
    startImmidiatly,
    tz
  );

  const log = new SysLog();
  log.level = 'info';
  log.message = 'Recurring complete';
  const interval = cronParser.parseExpression(cron, { tz });
  const nextRunAt = interval.next().toString();
  log.data = {
    recurringId: id,
    cron,
    nextRunAt
  };
  console.log(`Cron started ${id} '${cron}'. Next run at '${nextRunAt}`);
  logging(log);
}

export function restartCronService(throws = false) {
  if (throws) {
    return startRecurrings();
  }

  try {
    startRecurrings();
  } catch (e) {
    const log = new SysLog();
    log.message = 'Failed to restart cron service';
    log.data = errorToJSON(e);
    logging(log);
  }
}
