import * as moment from 'moment';
const thisYear = new Date().getFullYear();

export const BuiltInFieldDef = [
  {
    name: 'Given_Name',
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
    name: 'Surname',
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
    name: 'Company',
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
    name: 'Phone',
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
    name: 'Wechat',
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
    name: 'Address',
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
    name: 'Date_Of_Birth',
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
    name: 'Gender',
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
    name: 'TFN',
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
    name: 'ABN',
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
    name: 'ACN',
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
    name: 'Occupation',
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
    name: 'Industry',
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
    name: 'Remark',
    inputType: 'paragraphy',
    rules: [{ required: false, max: 500, message: ' ' }],
    inputProps: {
      maxLength: 500,
      allowClear: true,
      placeholder: '',
    },
    portofolioType: ['individual', 'business'],
  },
  {
    name: 'Year',
    inputType: 'year',
    rules: [{ required: true, message: 'Please choose a financial year' }],
    portofolioType: [],
  }
];

export const BuiltInFieldType = Array.from(new Set(BuiltInFieldDef.map(x => x.inputType)));

export const BuiltInFieldName = BuiltInFieldDef.map(x => x.name);