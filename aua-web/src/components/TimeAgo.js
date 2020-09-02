import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Upload, Modal, Space, Typography } from 'antd';
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from 'react-time-ago'
import * as moment from 'moment';
import styled from 'styled-components';

JavascriptTimeAgo.addLocale(en);

const { Text } = Typography;

const StyledSpace = styled(Space)`
font-size: 0.8rem;

.ant-space-item {
  margin-bottom: 0 !important;
}
`

export const TimeAgo = props => {
  const { surfix, value, defaultContent, direction, extra } = props;
  if (!value) {
    return defaultContent || null;
  }
  const m = moment(value);
  const realSurfix = surfix?.trim() ? `${surfix.trim()} ` : null;
  const display = direction === 'horizontal' ? 'inline-block' : 'block';
  return <StyledSpace size="small" direction="horizontal">
    <Space direction={direction} size="small">
      <Text>{realSurfix}<ReactTimeAgo date={m.toDate()} /></Text>
      <Text type="secondary"><small>{m.format('DD MMM YYYY HH:ss')}</small></Text>
    </Space>
    {extra}
  </StyledSpace>
}

TimeAgo.propTypes = {
  surfix: PropTypes.string,
  value: PropTypes.any.isRequired,
  defaultContent: PropTypes.string,
  direction: PropTypes.string,
  extra: PropTypes.any.isRequired,
};

TimeAgo.defaultProps = {
  direction: 'vertical',
  value: '',
  extra: null
};