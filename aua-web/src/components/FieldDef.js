import * as moment from 'moment';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { labelNameToVarName } from 'util/labelNameToVarName';

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
    portofolioType: ['individual'],
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
    portofolioType: ['individual'],
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
    portofolioType: ['business'],
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
    portofolioType: ['individual', 'business'],
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
    portofolioType: ['individual', 'business'],
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
    portofolioType: ['individual', 'business'],
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
    portofolioType: ['individual'],
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
    portofolioType: [],
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
    portofolioType: ['individual'],
  },
  {
    name: 'tfn',
    inputType: 'text',
    rules: [{ required: true, max: 20, message: ' ' }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portofolioType: ['individual'],
  },
  {
    name: 'abn',
    inputType: 'text',
    rules: [{ required: true, max: 20, message: ' ' }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portofolioType: ['business'],
  },
  {
    name: 'acn',
    inputType: 'text',
    rules: [{ required: true, max: 20, message: ' ' }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portofolioType: ['business'],
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
    portofolioType: ['individual'],
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
    portofolioType: ['business'],
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
    portofolioType: ['individual', 'business'],
  },
  {
    name: 'year',
    inputType: 'year',
    rules: [{ required: true, message: 'Please choose a financial year' }],
    portofolioType: [],
  },
  {
    name: 'monthRange',
    inputType: 'monthRange',
    rules: [{ required: true, message: 'Please choose start/end months' }],
    portofolioType: [],
  },
  {
    name: 'uploadFiles',
    inputType: 'upload',
    rules: [{ required: true, message: 'Please upload files' }],
    portofolioType: [],
  },
  {
    name: 'requireSign',
    inputType: 'upload',
    rules: [{ required: false, message: 'Please upload files' }],
    portofolioType: [],
  }
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