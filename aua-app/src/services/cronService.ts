import { getRepository, Not, Equal } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { CronJob } from 'cron';
import { SysLog } from '../entity/SysLog';
import { generateLodgementByJobTemplateAndPortofolio } from '../utils/generateLodgementByJobTemplateAndPortofolio';
import { assert } from '../utils/assert';
import { v4 as uuidv4 } from 'uuid';
import { LodgementStatus } from '../enums/LodgementStatus';
import { Lodgement } from '../entity/Lodgement';
import errorToJSON from 'error-to-json';
import * as moment from 'moment';
import { getUtcNow } from '../utils/getUtcNow';
import { CronLock } from '../entity/CronLock';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { User } from '../entity/User';
import * as os from 'os';

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

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(JobTemplate, 'j'), 'j', 'j.id = x."jobTemplateId"')
    .innerJoin(q => q.from(Portofolio, 'p'), 'p', 'p.id = x."portofolioId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .select([
      'x.*',
    ])
    .execute();

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

export async function executeRecurring(recurringId) {
  assert(recurringId, 400);
  const recurring = await getRepository(Recurring).findOne({ id: recurringId });
  assert(recurring, 404);
  const { jobTemplateId, portofolioId, nameTemplate } = recurring;

  const lodgement = await generateLodgementByJobTemplateAndPortofolio(
    jobTemplateId,
    portofolioId,
    (j, p) => nameTemplate.replace('{{createdDate}}', moment().format('DD MMM YYYY'))
  );

  lodgement.status = LodgementStatus.SUBMITTED;

  trySetLodgementDueDateField(lodgement, recurring.dueDay);

  await getRepository(Lodgement).save(lodgement);

  return lodgement;
}

function createCronJob(cron, onRunFn) {
  let cronPattern = cron;
  let onExecuteCallback = onRunFn;
  if (/L/.test(cron)) {
    cronPattern = cron.replace('L', '28-31');
    onExecuteCallback = async () => {
      const now = moment();
      const today = now.format('D');
      const lastDayOfMonth = now.endOf('month').format('D');
      if (today === lastDayOfMonth) {
        await onRunFn();
      }
    };
  }

  return new CronJob(
    cronPattern,
    onExecuteCallback,
    null,
    startImmidiatly,
    tz
  );
}


function startSingleRecurring(recurring: Recurring): CronJob {
  const { id, cron, jobTemplateId, portofolioId } = recurring;
  const job = createCronJob(
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
    }
  );

  const log = new SysLog();
  log.level = 'info';
  log.message = 'Recurring complete';
  log.data = {
    recurringId: id,
    cron
  };
  console.log(`Cron started recuring ${id} '${cron}'`);
  logging(log);
}

async function raceSingletonLock(): Promise<boolean> {
  const gitHash = process.env.GIT_HASH;
  if (!gitHash) {
    throw new Error(`Env var 'GIT_HASH' is not specified`);
  }
  if (process.env.NODE_ENV === 'dev') {
    return true;
  }

  const hostname = os.hostname();
  const repo = getRepository(CronLock);
  const key = 'cron-singleton-lock';
  const result = await repo.update(
    {
      key,
      gitHash: Not(Equal(gitHash))
    },
    {
      gitHash,
      lockedAt: getUtcNow(),
      winner: hostname
    }
  );
  const won = result.affected === 1;

  if (!won) {
    const entity = await repo.findOne({ key });
    if (entity) {
      entity.loser = hostname;
      await repo.save(entity);
    }
  }

  return won;
}

export async function restartCronService(throws = false) {
  try {
    const shouldStart = await raceSingletonLock();
    if (!shouldStart) {
      return;
    }

    if (throws) {
      return startRecurrings();
    }
    startRecurrings();
  } catch (e) {
    const log = new SysLog();
    log.message = 'Failed to restart cron service';
    log.data = errorToJSON(e);
    logging(log);
  }
}
