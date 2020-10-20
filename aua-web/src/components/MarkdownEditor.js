import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Typography } from 'antd';
import { saveDocTemplate, getDocTemplate } from 'services/docTemplateService';
import { notify } from 'util/notify';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import { Spin } from 'antd';
import { useWindowHeight } from '@react-hook/window-size'
import { SampleMarkdown } from '../pages/DocTemplate/SampleMarkdown';
import { BuiltInFieldDef } from 'components/FieldDef';
import { saveBlog } from 'services/blogService';
import { SampleBlog } from '../pages/AdminBlog/SampleBlog';
import { uploadFile } from 'services/http';

const mdParser = new MarkdownIt({ html: true, linkify: true });
const { Paragraph, Text } = Typography;

export const MarkdownEditor = props => {
  const { value, style, onChange } = props;

  const handleChange = e => {
    onChange(e.text);
  }

  const onImageUpload = async (imageBlob) => {
    const file = await uploadFile(imageBlob);
    return file.location;
  }

  return <MdEditor
    value={value}
    style={style}
    renderHTML={(text) => mdParser.render(text)}
    onChange={handleChange}
    onImageUpload={onImageUpload}
  />
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  style: PropTypes.object
};

MarkdownEditor.defaultProps = {
};

export default MarkdownEditor;
