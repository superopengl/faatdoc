
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { BusinessProfile } from '../entity/BusinessProfile';
import { IndividualProfile } from '../entity/IndividualProfile';
import { handlerWrapper } from '../utils/asyncHandler';
import { json2csvAsync } from 'json-2-csv';

export const downloadMemberCsv = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const individualData = await getConnection()
  .createQueryBuilder()
  .from(User, 'u')
  .innerJoin(q => q.from(IndividualProfile, 'p').select('*'), 'p', 'u.id = p.id')
  .orderBy('u."memberId"')
  .select([
    `"memberId" AS "Member ID"`,
    `"email" AS "Email"`,
    `"name" AS "Name"`,
    `"secondaryName" AS "Secondary Name"`,
    `"createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney' AS "Created Time"`,
    `"lastLoggedInAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney' AS "Last Login Time"`,
    `"status" AS "Status"`,
    `"phone" AS "Phone"`,
    `"referrer" AS "Referrer"`,
    `"approvalDirector" AS "ApprovalDirector"`,
    `"address" AS "Address"`,
    `"facebook" AS "Facebook"`,
    `"instagram" AS "Instagram"`,
    `to_char("dob", 'MM/DD/YYYY') AS "Date of Birth"`,
    `"gender" AS "Gender"`,
    `"wechat" AS "Wechat"`,
    `"skype" AS "Skype"`,
    `"occupation" AS "Occupation"`,
    `"hobby" AS "Hobbies"`
  ])
  .execute();

  const businessData = await getConnection()
  .createQueryBuilder()
  .from(User, 'u')
  .innerJoin(q => q.from(BusinessProfile, 'p').select('*'), 'p', 'u.id = p.id')
  .orderBy('u."memberId"')
  .select([
    `"memberId" AS "Member ID"`,
    `"email" AS "Email"`,
    `"name" AS "Name"`,
    `"secondaryName" AS "Secondary Name"`,
    `"createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney' AS "Created Time"`,
    `"lastLoggedInAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney' AS "Last Login Time"`,
    `"status" AS "Status"`,
    `"phone" AS "Phone"`,
    `"referrer" AS "Referrer"`,
    `"approvalDirector" AS "ApprovalDirector"`,
    `"address" AS "Address"`,
    `"contact" AS "Business Contact"`,
    `"facebook" AS "Facebook"`,
    `"instagram" AS "Instagram"`,
    `"website" AS "Website"`,
    `"remark" AS "Remark"`
  ])
  .execute();

  const all = [...individualData, ...businessData];

  const csv = await json2csvAsync(all, {emptyFieldValue: '', useLocaleFormat: true});

  res.send(csv);
});
