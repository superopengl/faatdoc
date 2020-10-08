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
  const {onBack, onNext, showsBack, loading} = props;

  const nextButtonProps = onNext ? {
    onClick: () => onNext()
  } : {
    htmlType: 'submit'
  }

  return <>
  <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 20 }}>
    <Button shape="circle" size="large" onClick={() => onBack()} icon={<LeftOutlined />} style={{visibility: showsBack ? 'visible' : 'hidden'}}></Button>
    {/* <Button onClick={() => onSkip()}>Skip</Button> */}
    <Button shape="circle" size="large" type="primary" icon={<RightOutlined />} disabled={loading} {...nextButtonProps}></Button>
  </Space></>
};

StepButtonSet.propTypes = {
};

StepButtonSet.defaultProps = {
  showsBack: true,
  loading: false
};

export default StepButtonSet;
