import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Tabs, Typography, TimePicker, Space, Select } from 'antd';
import * as moment from 'moment';
import cronstrue from 'cronstrue';
// import 'react-cron-generator/dist/cron-builder.css'

const { Text } = Typography;

const StyledSpace = styled(Space)`
border: 1px solid rgba(217,217,217);
border-radius: 2px;
padding: 11px;
width: 100%;
`;


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
  const { value, onChange } = props;
  const matches = /.+ (.+) (.+) (.*) \*\/(.+) (.+)/.exec(value || '0 0 0 L */1 *');
  const defaultMinute = matches[1];
  const defaultHour = matches[2];
  const defaultDayOfMonth = matches[3];
  const defaultEveryXMonth = matches[4];
  const dafaultDayOfWeek = matches[5];
  const defaultPeriod = dafaultDayOfWeek === '*' ? 'monthly' : 'weekly';

  const [dayOfMonth, setDayOfMonth] = React.useState(defaultDayOfMonth);
  const [dayOfWeek, setDayOfWeek] = React.useState(dafaultDayOfWeek);
  const [everyXMonth, setEveryXMonth] = React.useState(defaultEveryXMonth);
  const [hour, setHour] = React.useState(defaultHour);
  const [minute, setMinute] = React.useState(defaultMinute);
  const [expression, setExpression] = React.useState('');

  React.useEffect(() => {
    const cron = `0 ${minute} ${hour} ${dayOfMonth} */${everyXMonth} ${dayOfWeek}`;
    const expression = cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true });
    setExpression(expression);
    // onChange(cron);
  }, [minute, hour, dayOfMonth, everyXMonth, dayOfWeek])

  const handleValueChange = (m, h, dom, exm, dw) => {
    const cron = `0 ${m || minute} ${h || hour} ${dom || dayOfMonth} */${exm || everyXMonth} ${dw || dayOfWeek}`;
    if (m) setMinute(`${m}`);
    if (h) setHour(`${h}`);
    if (dom) setDayOfMonth(`${dom}`);
    if (exm) setEveryXMonth(`${exm}`);
    if (dw) setDayOfWeek(`${dw}`);
    const expression = cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true });
    setExpression(expression);
    // console.log('expression', expression);
    onChange(cron);
  }

  const handleEveryXMonthChange = value => {
    // setEveryXMonth(value);
    // setDayOfWeek('*');
    handleValueChange(null, null, null, value, '*');
  }

  const handleDayOfMonthChange = value => {
    // setDayOfMonth(value);
    // setDayOfWeek('*');
    handleValueChange(null, null, value, null, '*');
  }

  const handleDayOfWeekChange = value => {
    // setDayOfWeek(value);
    // setDayOfMonth('*');
    handleValueChange(null, null, '*', null, value);
  }

  const handleTimeChange = value => {
    if (!value) return;
    // setHour(value.format('H'));
    // setMinute(value.format('m'));
    handleValueChange(value.format('m'), value.format('H'), null, null, null);
  }

  const handleChangePeriod = period => {
    switch (period) {
      case 'weekly':
        // setDayOfWeek(0);
        // setDayOfMonth('*')
        handleValueChange(null, null, '*', '1', '0');
        break;
      case 'monthly':
        // setDayOfWeek('*');
        // setDayOfMonth(1)
        handleValueChange(null, null, 'L', null, '*');
        break;
      default:
        throw new Error(`Unsupported period ${period}`);
    }
  }



  return (<><StyledSpace direction="vertical" size="middle">

    <Tabs type="card" defaultActiveKey={defaultPeriod} onChange={handleChangePeriod}>
      <Tabs.TabPane tab="Monthly" key="monthly">
        <div>Day <Select style={{ width: 100 }}
          onChange={handleDayOfMonthChange}
          value={dayOfMonth}
        >
          {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={`${i + 1}`}>{i + 1}</Select.Option>)}
          <Select.Option value="L">Last day</Select.Option>
        </Select> of every <Select style={{ width: 60 }} onChange={handleEveryXMonthChange} value={everyXMonth}>
            <Select.Option value="1">1</Select.Option>
            <Select.Option value="2">2</Select.Option>
            <Select.Option value="3">3</Select.Option>
            <Select.Option value="6">6</Select.Option>
          </Select> month(s)</div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Weekly" key="weekly">
        <Select style={{ width: 120 }}
          onChange={handleDayOfWeekChange}
          value={dayOfWeek}
        >
          <Select.Option value="0">Sunday</Select.Option>
          <Select.Option value="1">Monday</Select.Option>
          <Select.Option value="2">Tuesday</Select.Option>
          <Select.Option value="3">Wendesday</Select.Option>
          <Select.Option value="4">Thursday</Select.Option>
          <Select.Option value="5">Friday</Select.Option>
          <Select.Option value="6">Saturday</Select.Option>
        </Select> of every week
      </Tabs.TabPane>
    </Tabs>
    <div>At <TimePicker
      defaultValue={moment(`${hour}:${minute}`, 'H:m')}
      format="hh:mm A"
      minuteStep={5}
      use12Hours={true}
      onChange={handleTimeChange}
    /></div>
  </StyledSpace>
    <Text type="secondary">Preview: {expression || null}</Text>
  </>)
}

CronInput.propTypes = {
  value: PropTypes.string,
};

CronInput.defaultProps = {
};
