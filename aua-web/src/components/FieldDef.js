import * as moment from 'moment';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { labelNameToVarName } from 'util/labelNameToVarName';
import {isValidABN, isValidACN, isValidABNorACN} from "abnacn-validator";
import tfn, * as tfc from 'tfn';

const isValidTfn = (text) => tfn(text).valid;

export const BuiltInFieldDef = [
  {
    name: 'givenName',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "given-name",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['individual'],
  },
  {
    name: 'surname',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "family-name",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['individual'],
  },
  {
    name: 'company',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "organization",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['business'],
  },
  {
    name: 'phone',
    description: `split with ', ' if there are more than one`,
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 30, message: ' ' }],
    inputProps: {
      autoComplete: "tel",
      maxLength: 30,
      allowClear: true,
      placeholder: '',
      type: 'tel',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'wechat',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'address',
    inputType: 'text',
    rules: [{ required: true, max: 100, message: ' ' }],
    inputProps: {
      maxLength: 100,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'dateOfBirth',
    inputType: 'date',
    rules: [{
      required: true,
      validator: async (rule, value) => {
        if (!value) return;
        if (moment(value).isAfter()) {
          throw new Error();
        }
      },
      message: 'Invalid date or not a past date'
    }],
    inputProps: {
      autoComplete: 'bday'
    },
    portfolioType: ['individual'],
  },
  {
    name: 'dueDate',
    inputType: 'date',
    rules: [{
      required: true,
      validator: async (rule, value) => {
        if (!value) return;
        if (moment(value).isBefore()) {
          throw new Error();
        }
      },
      message: 'Invalid date or not a furture date'
    }],
    portfolioType: [],
  },
  {
    name: 'gender',
    inputType: 'select',
    rules: [{ required: false, message: 'Please choose a gender' }],
    options: [
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
      {
        label: 'Other',
        value: 'other',
      }
    ],
    portfolioType: ['individual'],
  },
  {
    name: 'tfn',
    inputType: 'text',
    rules: [{ required: true, validator: (rule, value) => isValidTfn(value) ? Promise.resolve() : Promise.reject('Invalid TFN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual'],
  },
  {
    name: 'abn',
    inputType: 'text',
    rules: [{ required: true, validator: (rule, value) => isValidABN(value) ? Promise.resolve() : Promise.reject('Invalid ABN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['business'],
  },
  {
    name: 'acn',
    inputType: 'text',
    rules: [{ required: true, validator: (rule, value) => isValidACN(value) ? Promise.resolve() : Promise.reject('Invalid ACN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['business'],
  },
  {
    name: 'occupation',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual'],
  },
  {
    name: 'industry',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['business'],
  },
  {
    name: 'remark',
    inputType: 'paragraph',
    rules: [{ required: false, max: 500, message: ' ' }],
    inputProps: {
      maxLength: 500,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'year',
    inputType: 'year',
    rules: [{ required: true, message: 'Please choose a financial year' }],
    portfolioType: [],
  },
  {
    name: 'monthRange',
    inputType: 'monthRange',
    rules: [{ required: true, message: 'Please choose start/end months' }],
    portfolioType: [],
  },
];

export const BuiltInFieldType = Array.from(new Set(BuiltInFieldDef.map(x => x.inputType))).filter(x => x !== 'select');

export const BuiltInFieldLabelNames = BuiltInFieldDef.map(x => varNameToLabelName(x.name));

export const getBuiltInFieldByVarName = (varName) => {
  return BuiltInFieldDef.find(x => x.name === varName);
}

export const getBuiltInFieldByLabelName = (labelName) => {
  const varName = labelNameToVarName(labelName);
  return getBuiltInFieldByVarName(varName);
}
