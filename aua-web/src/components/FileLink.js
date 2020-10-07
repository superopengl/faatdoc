import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Spin } from 'antd';
import { getFile } from 'services/fileService';

const { Text } = Typography;


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

  if (!fileUrl) {
    return <Spin>{name}</Spin>
  }

  return <Button style={{paddingLeft: 0, paddingRight: 0}} type="link" href={fileUrl} target="_blank">{name}</Button>
}

FileLink.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  location: PropTypes.string,
};

export default FileLink
