
import React from 'react';
import styled from 'styled-components';
import { Button, Form, Typography, Radio,Space } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
const { Text } = Typography;

const Container = styled.div`
.ant-radio-button-wrapper:not(:first-child)::before {
  display: none;
}

.ant-radio-button-wrapper {
  border-width: 1px;
  display: block;
  margin-bottom: 1rem;
  border-radius: 6px;

  &.portofolio {
    height: 60px;
    padding-top: 10px;
  }
}

`;

export const TaskGenerator = props => {
  const { jobTemplateList, portofolioList } = props;

  const handleChange = (values) => {
    props.onChange(values);
  }

  return (
    <Container>
    <Form layout="vertical" onFinish={handleChange}>
      <Form.Item label="Choose task type" name="jobTemplateId" rules={[{ required: true, message: 'Please choose which type task to proceed' }]}>
        <Radio.Group buttonStyle="outline" style={{ width: '100%' }}>
          {jobTemplateList.map((item, i) => <Radio.Button key={i} value={item.id}>{item.name}</Radio.Button>)}
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Choose portofolio to fill the task automatically" name="portofolioId" rules={[{ required: true, message: 'Please choose how to fill the task form' }]}>
        <Radio.Group buttonStyle="outline" style={{ width: '100%' }}>
          {portofolioList.map((item, i) => <Radio.Button className="portofolio" key={i} value={item.id}>
            <Space>
              <PortofolioAvatar value={item.name} size={40}/>
              {item.name}
            </Space>
          </Radio.Button>)}
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" icon={<DoubleRightOutlined />}>Next</Button>
      </Form.Item>
    </Form>
    </Container>
  );
};