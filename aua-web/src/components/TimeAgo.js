import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Upload, Modal, Button, Typography } from 'antd';
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from 'react-time-ago'
import * as moment from 'moment';

JavascriptTimeAgo.addLocale(en);

const { Text } = Typography;

export const TimeAgo = props => {
  const {surfix, value, defaultContent, direction} = props;
  if(!value) {
    return defaultContent || null;
  }
  const m = moment(value);
  const realSurfix = surfix?.trim() ? `${surfix.trim()} ` : null;
  const display = direction === 'horizontal' ? 'inline-block' : 'block';
  return <div style={{display: 'inline-block', fontSize: '0.8rem'}}>
    <Text style={{display, marginRight: '1rem'}}>{realSurfix}<ReactTimeAgo date={m.toDate()}/></Text> 
    <Text style={{display}} type="secondary"><small>{m.format('DD MMM YYYY HH:ss')}</small></Text>
  </div>
}

TimeAgo.propTypes = {
  surfix: PropTypes.string,
  value: PropTypes.any.isRequired,
  defaultContent: PropTypes.string,
  direction: PropTypes.string,
};

TimeAgo.defaultProps = {
  direction: 'vertical',
  value: ''
};