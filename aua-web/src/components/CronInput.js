import React from 'react';
import PropTypes from 'prop-types';

import * as _ from 'lodash';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import toMaterialStyle from 'material-color-hash';
import { Tabs, Typography, Radio, Button, Modal, Input, TimePicker, Space, Select } from 'antd';
import Cron, { HEADER } from 'react-cron-generator';
import * as moment from 'moment';
import * as cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
// import 'react-cron-generator/dist/cron-builder.css'

const { Title, Text } = Typography;

const radioStyle = {
  display: 'block',
  height: '40px',
  lineHeight: '30px',
};

/**
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
 */
export const CronInput = props => {
  const { value, onChange, ...other } = props;
  const [dayOfMonth, setDayOfMonth] = React.useState(1);
  const [dayOfWeek, setDayOfWeek] = React.useState('*');
  const [everyXMonth, setEveryXMonth] = React.useState(1);
  const [hour, setHour] = React.useState(0);
  const [minute, setMinute] = React.useState(0);
  const [expression, setExpression] = React.useState('');

  React.useEffect(() => {
    const cron = `0 ${minute} ${hour} ${dayOfMonth} */${everyXMonth} ${dayOfWeek}`;
    const expression = cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true });
    props.onChange(cron);
    setExpression(expression);
  }, [minute, hour, dayOfMonth, everyXMonth, dayOfWeek])

  const handleEveryXMonthChange = value => {
    setEveryXMonth(value);
    setDayOfWeek('*');
  }
  const handleDayOfMonthChange = value => {
    setDayOfMonth(value);
    setDayOfWeek('*');
  }

  const handleDayOfWeekChange = value => {
    setDayOfWeek(value);
    setDayOfMonth('*');
  }

  const handleTimeChange = value => {
    if(!value) return;
    setHour(value.format('H'));
    setMinute(value.format('m'));
  }

  return (<Space direction="vertical" size="small">
    <Radio.Group
    // onChange={handleMonthlyOptionChange} 
    // value={value}
    defaultValue="monthly"
    >
      <Radio style={radioStyle} value='monthly'>
        Day <Select style={{ width: 60 }} onChange={handleDayOfMonthChange} defaultValue={dayOfMonth}>
          {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={i + 1}>{i + 1}</Select.Option>)}
        </Select> of every <Select style={{ width: 60 }} onChange={handleEveryXMonthChange} defaultValue={everyXMonth}>
          <Select.Option value={1}>1</Select.Option>
          <Select.Option value={2}>2</Select.Option>
          <Select.Option value={3}>3</Select.Option>
          <Select.Option value={6}>6</Select.Option>
        </Select> month(s)
        </Radio>
      <Radio style={radioStyle} value='weekly'>
        <Select style={{ width: 120 }} onChange={handleDayOfWeekChange} defaultValue={dayOfWeek}>
          <Select.Option value="*"></Select.Option>
          <Select.Option value={0}>Sunday</Select.Option>
          <Select.Option value={1}>Monday</Select.Option>
          <Select.Option value={2}>Tuesday</Select.Option>
          <Select.Option value={3}>Wendesday</Select.Option>
          <Select.Option value={4}>Thursday</Select.Option>
          <Select.Option value={5}>Friday</Select.Option>
          <Select.Option value={6}>Saturday</Select.Option>
        </Select> of every week
        </Radio>
    </Radio.Group>
    <TimePicker
      defaultValue={moment(`${hour}:${minute}`, 'H:m')}
      format="hh:mm A"
      minuteStep={5}
      use12Hours={true}
      onChange={handleTimeChange}
    />
    {expression && <Text>{expression}</Text>}
  </Space>);
}

CronInput.propTypes = {
  value: PropTypes.string,
};

CronInput.defaultProps = {
};
