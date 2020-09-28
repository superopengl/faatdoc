import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Affix, Button, Form, Input, Radio, Space, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import JobChat from 'pages/AdminJob/JobChat';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { generateJob, getJob, saveJob } from 'services/jobService';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { FileUploader } from '../../components/FileUploader';
import JobGenerator from './JobGenerator';
import * as queryString from 'query-string';

const AutoDocEditor = props => {

}

AutoDocEditor.propTypes = {
  job: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

AutoDocEditor.defaultProps = {
  disabled: false
};

export default AutoDocEditor;