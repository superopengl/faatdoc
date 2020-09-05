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

const { TabPane } = Tabs;

const StyledCron = styled.div`
.cron_builder_bordering {
  border: 1px solid #d9d9d9;
  // border-top: none; 
  text-align: center;
  padding: 10px;
  background: #fff;
  margin-top: 4px;
}
.cron_builder_bordering input, .cron_builder_bordering select {
  width: 100px;
  margin-right: 10px;
  margin-left: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  padding-left: 5px;
  cursor: pointer;
}

.df {
  display: flex;
}
.cron-builder-bg {
  // background-color: #086090;
  color: white;
  text-align: center;
  margin-bottom: 4px;
  padding: 8px 0px;
}
.cron_builder_bordering select {
  background-color: white;
  width: 75px;
  cursor: pointer;
  padding: 4px 0px;
  border-radius: 4px;
}
.cron_builder_bordering select option:hover {
  background-color: #086090;
}

.tab-pane, .container-fluid {
  text-align: left;

}
.well {
  padding: 0.5rem;
  text-align: left;
}
.well-small input {
  width: auto !important;
}
.cron_builder_bordering  input[type='radio'] {
  margin-top: 0px;
  vertical-align: middle;
}
.cron_builder {
  border: 1px solid #d9d9d9;
  border: none;
  border-radius: 2px;
  padding: 0;
  background-color: white;
  width: 100%;
}
.text_align_left {
  text-align: left;
}


ul.nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav.nav-tabs {
  padding-left: 0;
}

.nav li {
  cursor: pointer;
  display: inline;
  border: solid;
  border-width: 1px;
  border-color: #d9d9d9;
  margin: 0 5px 0 0;
  padding: 0.5rem 1rem;
  background-color: rgb(250, 250, 250);

  a {
    color: rgba(0, 0, 0, 0.85);
  }

  &.active {
    background-color: white;
    border-width: 1px 1px 0 1px;

    a {
      color: #143e86;
    }
  }
}
`;

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
    {/* <StyledCron><Cron
      onChange={onChange}
      value={value}
      showResultText={true}
      showResultCron={true}
      options={{ headers: [HEADER.MONTHLY, HEADER.WEEKLY] }}
    />
    </StyledCron> */}
  </Space>);
}

CronInput.propTypes = {
  value: PropTypes.string,
};

CronInput.defaultProps = {
};
