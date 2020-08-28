
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout, Typography, Input, Button, DatePicker } from 'antd';
import * as moment from 'moment';

const { RangePicker } = DatePicker;

function convertToMoments(value) {
  if (!value) return value;
  return Array.isArray(value) ? value.map(x => moment(x)) : moment(value);
}

export const RangePickerInput = (props) => {
  const { defaultValue, value } = props;
  return <RangePicker {...props}
    defaultValue={convertToMoments(defaultValue)}
    value={convertToMoments(value)}
    onChange={(moment, dateString) => props.onChange(dateString)} />;
}

RangePickerInput.propTypes = {
  // defaultValue: PropTypes.string,
  // value: PropTypes.string
};
