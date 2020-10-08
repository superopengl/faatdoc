import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Spin, Space } from 'antd';
import { getFile } from 'services/fileService';
import { FileIcon } from './FileIcon';

const { Text, Link } = Typography;


const FileLink = props => {
  const { placeholder, name, id, location } = props;
  const [fileUrl, setFileUrl] = React.useState(location);
  const [fileName, setFileName] = React.useState(placeholder || name);
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    if (location) {
      setFileUrl(location);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      const file = await getFile(id);
      setFileName(file.fileName);
      setFileUrl(file.location);
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, [location, id]);

  return <Spin spinning={loading}>
    <Button block style={{ paddingLeft: 0, paddingRight: 0 }} type="link" href={fileUrl} target="_blank">
      <Space style={{ width: '100%' }}>
        <FileIcon name={fileName} />
        <span style={{ position: 'relative', top: -4 }}>{fileName}</span>
      </Space>
    </Button>
  </Spin>
}

FileLink.propTypes = {
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  location: PropTypes.string,
};

export default FileLink
