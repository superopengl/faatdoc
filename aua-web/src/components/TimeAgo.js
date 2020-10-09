import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Space, Typography } from 'antd';
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
  line-height: 15px;
}
`

export const TimeAgo = props => {
  const { surfix, value, defaultContent, direction, strong, extra, accurate } = props;
  if (!value) {
    return defaultContent || null;
  }
  const m = moment(value);
  const realSurfix = surfix?.trim() ? `${surfix.trim()} ` : null;
  return <StyledSpace size="small" direction="horizontal">
    <Space direction={direction} size="small">
      <Text strong={strong} type="secondary">{realSurfix}<ReactTimeAgo date={m.toDate()} /></Text>
      {accurate && <Text strong={strong} type="secondary"><small>{m.format('DD MMM YYYY HH:mm')}</small></Text>}
    </Space>
    {extra}
  </StyledSpace>
}

TimeAgo.propTypes = {
  surfix: PropTypes.string,
  value: PropTypes.any,
  defaultContent: PropTypes.any,
  direction: PropTypes.string,
  extra: PropTypes.any,
  strong: PropTypes.bool,
  accurate: PropTypes.bool.isRequired,
};

TimeAgo.defaultProps = {
  direction: 'vertical',
  extra: null,
  strong: false,
  accurate: true,
};