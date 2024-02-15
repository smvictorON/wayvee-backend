import Audit  from "../models/Audit"
import _ from 'lodash'

export const setAudit = async (
  model: string,
  idDocument: any,
  beforeData: any,
  afterData: any,
  user: string,
  company: string
) => {
  const { before, after } = setDiff(beforeData, afterData);

  await new Audit({
    model,
    idDocument,
    before,
    after,
    user,
    company
  }).save()
}

const setDiff = (before: any, after: any) => {
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);

  for (const key of beforeKeys) {
    if (afterKeys.includes(key) && JSON.stringify(before[key]) === JSON.stringify(after[key])) {
      delete before[key];
      delete after[key];
    }
  }

  return { before, after };
}