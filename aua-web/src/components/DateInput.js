
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import * as moment from 'moment';

export const DateInput = (props) => {
  const {defaultValue, value} = props;
  return <DatePicker {...props} 
  defaultValue={defaultValue ? moment(defaultValue) : defaultValue}
  value={value ? moment(value) : value}
  onChange={(moment, dateString) => props.onChange(dateString)} />;
}

DateInput.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string
};
