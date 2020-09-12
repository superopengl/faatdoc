
import React from 'react';
import { Button, Form, Typography, Radio } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
const { Text } = Typography;

export const TaskGenerator = props => {
  const { jobTemplateList, portofolioList } = props;

  const handleChange = (values) => {
    props.onChange(values);
  }

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  return (
    <Form layout="vertical" onFinish={handleChange}>
      <Form.Item>
        <Text type="secondary">Please choose a task type</Text>
      </Form.Item>
      <Form.Item label="Choose the type of your task" name="jobTemplateId" rules={[{ required: true, message: 'Please choose which type task to proceed' }]}>
        <Radio.Group  buttonStyle="solid" style={{width: '100%'}}>
          {jobTemplateList.map((item, i) => <Radio style={radioStyle} key={i} value={item.id}>{item.name}</Radio>)}
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Reuse existing portofolio to prefill the lodgment" name="portofolioId" rules={[{ required: true, message: 'Please choose how to fill the task form' }]}>
        <Radio.Group  buttonStyle="solid" style={{width: '100%'}}>
          {portofolioList.map((item, i) => <Radio style={radioStyle} key={i} value={item.id}>{item.name}</Radio>)}
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" icon={<DoubleRightOutlined/>}>Next</Button>
      </Form.Item>
    </Form>
  );
};