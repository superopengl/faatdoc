import React from 'react';
import PropTypes from 'prop-types';

import * as _ from 'lodash';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';


const StyledFileIcon = styled.div`
  display: inline-block;
`;

export const FileIcon = props => {
  const { name, width } = props;

  if(!name) return null;

  const height = width / 40 * 50;
  const tokens = name.split('.');
  const ext = tokens[tokens.length - 1];

  return <StyledFileIcon style={{width, height }}><ReactFileIcon extension={ext} {...defaultStyles[ext]} /></StyledFileIcon>;
}

FileIcon.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.number,
};

FileIcon.defaultProps = {
  width: 40,
};
