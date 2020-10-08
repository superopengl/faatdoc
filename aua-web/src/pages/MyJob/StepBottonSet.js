import { Button, Form, Input, Radio, Typography, Divider, Space } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { merge } from 'lodash';
import { LeftOutlined, RightOutlined, StarTwoTone } from '@ant-design/icons';

const { Text } = Typography;

const StepButtonSet = (props) => {
  const {onBack, onSkip, showsBack, loading} = props;

  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    <Button shape="circle" size="large" onClick={() => onBack()} icon={<LeftOutlined />} style={{visibility: showsBack ? 'visible' : 'hidden'}}></Button>
    {/* <Button onClick={() => onSkip()}>Skip</Button> */}
    <Button shape="circle" size="large" type="primary" htmlType="submit" icon={<RightOutlined />} disabled={loading}></Button>
  </Space>
};

StepButtonSet.propTypes = {
};

StepButtonSet.defaultProps = {
  showsBack: true,
  loading: false
};

export default StepButtonSet;
