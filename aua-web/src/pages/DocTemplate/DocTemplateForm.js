import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Typography } from 'antd';
import { saveDocTemplate, getDocTemplate } from 'services/docTemplateService';
import { notify } from 'util/notify';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import { Spin } from 'antd';
import { useWindowHeight } from '@react-hook/window-size'
import { SampleMarkdown } from './SampleMarkdown';

const mdParser = new MarkdownIt(/* Markdown-it options */);
const { Paragraph, Text } = Typography;

const DocMarkdownEditor = props => {
  const { value, style, onChange } = props;

  const handleChange = e => {
    onChange(e.text);
  }

  return <MdEditor
    value={value}
    style={style}
    renderHTML={(text) => mdParser.render(text)}
    onChange={handleChange}
  />
}

const EMPTY_TEMPLATE = {
  name: 'xx',
  md: SampleMarkdown
}

const DocTemplateForm = (props) => {

  const { id } = props;

  const windowHeight = useWindowHeight();
  const [entity, setEntity] = React.useState(EMPTY_TEMPLATE);
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const entity = await getDocTemplate(id);
      setEntity(entity);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const handleSave = async (values) => {
    const { name } = values;
    const newEntity = {
      ...entity,
      ...values
    }
    await saveDocTemplate(newEntity);
    props.onOk();
    notify.success(<>Successfully saved doc template <strong>{name}</strong></>)
  }

  if (loading) {
    return <Spin />
  }

  // debugger;
  return (
    // <Space direction="vertical" size="small" style={{ width: '100%' }}>
    <Form onFinish={handleSave} initialValues={entity} style={{position: 'relative'}}>
      <Form.Item style={{ marginRight: 120 }} name="name" rules={[{ required: true, message: ' ', max: 100 }]}>
        <Input style={{ marginRight: '1rem' }} placeholder="Doc Template Name" />
      </Form.Item>
      <Button style={{ position: 'absolute', right: 0, top: 0, width: 100 }} htmlType="submit" type="primary">Save</Button>
      <Form.Item name="description" rules={[{ required: true, message: ' ' }]}>
        <Input.TextArea allowClear autoSize={{minRows: 3}}/>
      </Form.Item>
      <Paragraph type="secondary">
        Refer to <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">https://www.markdownguide.org/basic-syntax/</a> for Markdown basic syntax. Use double curly braces to express the field variables like <Text code>{'{{givenName}}'}</Text>, <Text code>{'{{now}}'}</Text>.
        </Paragraph>
      <Form.Item name="md" rules={[{ required: true, message: ' ' }]}>
        <DocMarkdownEditor
          style={{ height: windowHeight - 280 }}
        />
      </Form.Item>
    </Form >
    // </Space>
  );
};

DocTemplateForm.propTypes = {
  id: PropTypes.string,
};

DocTemplateForm.defaultProps = {
};

export default withRouter(DocTemplateForm);
