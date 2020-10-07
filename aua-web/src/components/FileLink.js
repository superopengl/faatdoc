import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Divider, Skeleton, Alert, Space, Typography, Spin, Form } from 'antd';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { getFile } from 'services/fileService';

const { Paragraph, Title, Text } = Typography;

const StyledFileIcon = styled.div`
  display: inline-block;
`;

const FileLink = props => {
  const { name, id, location } = props;
  const [fileUrl, setFileUrl] = React.useState(location);

  const loadEntity = async () => {
    if (location) {
      setFileUrl(location);
      return;
    }
    const file = await getFile(id);
    setFileUrl(file.location);
  }

  React.useEffect(() => {
    loadEntity();
  }, [location]);

  // debugger;

  if (!fileUrl) {
    return <Text disabled><Spin /> {name}</Text>
  }

  return <Button type="link" href={fileUrl} target="_blank">{name}</Button>
}

FileLink.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  location: PropTypes.string,
};

export default FileLink
