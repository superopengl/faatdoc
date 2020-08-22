
import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Table, Space, Typography, Radio } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { listJobTemplate } from 'services/jobTemplateService';
import { listLodgement } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';

const { Text, Paragraph, Title } = Typography;


export const ChooseJobTemplateWithPortofolioComponent = props => {
  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [chosenJobTemplateId, setChosenJobTemplateId] = React.useState();
  const [chosenPortofolioId, setChosenPortofolioId] = React.useState();

  const loadList = async (force = false) => {
    if (!initialLoaded || force) {
      const jobTemplateList = await listJobTemplate() || [];
      const portofolioList = await listPortofolio() || [];

      setJobTemplateList(jobTemplateList);
      setPortofolioList(portofolioList);
      setInitialLoaded(true);
    }
  }

  React.useEffect(() => {
    loadList();
  })

  const handleChange = (values) => {
    values.portofolioId = values.portofolioId === 'nothing' ? undefined : values.portofolioId;
    props.onChange(values);
  }

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  return (
    <>
      {initialLoaded && <>
        <Form layout="vertical" onFinish={handleChange}>
          <Form.Item>
            <Text type="secondary">Please choose a lodgement type</Text>
          </Form.Item>
          <Form.Item label="Choose the type of your lodgement" name="jobTemplateId" rules={[{ required: true, message: 'Please choose which type lodgement to proceed' }]}>
            <Radio.Group onChange={setChosenJobTemplateId} buttonStyle="solid">
              {jobTemplateList.map((item, i) => <Radio style={radioStyle} key={i} value={item.id}>{item.name}</Radio>)}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Reuse existing portofolio to prefill the lodgment (Optional)" name="portofolioId" rules={[{ required: true, message: 'Please choose how to fill the lodgement form' }]}>
            <Radio.Group onChange={value => setChosenPortofolioId(value)}>
              {portofolioList.map((item, i) => <Radio style={radioStyle} key={i} value={item.id}>{item.name}</Radio>)}
              <Radio style={radioStyle} value='nothing'>
                Not use any of above
            </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">Next</Button>
          </Form.Item>
        </Form>
      </>}
    </>
  );
};