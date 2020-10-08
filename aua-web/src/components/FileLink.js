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
    loadEntity()
  }, [location, id]);

  return <Spin spinning={loading}>
    <Link href={fileUrl} target="_blank" style={{ width: '100%' }}>
      <Space style={{ width: '100%', alignItems: 'center' }}>
        <FileIcon name={fileName} />
        {fileName}
      </Space>
    </Link>
  </Spin>
}

FileLink.propTypes = {
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  location: PropTypes.string,
};

export default FileLink
