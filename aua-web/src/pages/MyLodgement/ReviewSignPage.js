import { Button, List, Space, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import { FileIcon } from 'components/FileIcon';
import { TimeAgo } from 'components/TimeAgo';
import PropTypes from 'prop-types';
import React from 'react';
import { searchFile } from 'services/fileService';
import { getLodgement, signLodgement } from 'services/lodgementService';
import styled from 'styled-components';
import { getFileUrl } from 'util/getFileUrl';

const { Link: TextLink } = Typography;

const StyledListItem = styled(List.Item)`
  cursor: pointer;

  // &:hover {
  //   background-color: rgba(0,0,0,0.1);
  // }

`;

const ReviewSignPage = (props) => {
  const { id, readonly } = props;

  const [, setLoading] = React.useState(true);
  const [lodgement, setLodgement] = React.useState({});
  const [files, setFiles] = React.useState([]);


  const getSignFiles = async (lodgement) => {
    const fileids = lodgement?.fields?.find(x => x.name === 'requireSign')?.value;
    if (!fileids.length) return [];

    const files = await searchFile(fileids);
    return files
  }

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const lodgement = await getLodgement(id);
      const files = await getSignFiles(lodgement);
      setFiles(files);
      setLodgement(lodgement);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleSign = async () => {
    await signLodgement(lodgement.id);
    props.onFinish();
  }

  const handleCancel = () => {
    props.onCancel();
  }

  const { status } = lodgement || {};

  const isSigned = status === 'signed';
  const canSign = status === 'to_sign' && files.every(f => !!f.lastReadAt) && !isSigned;

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={files}
        renderItem={item => (<StyledListItem
          key={item.id}
          actions={[
            <Button type="link">View</Button>
          ]}
        >
          <List.Item.Meta
            avatar={<FileIcon name={item.fileName} />}
            title={<TextLink strong={!item.lastReadAt} href={getFileUrl(item.id)} target="_blank" onClick={() => loadEntity()}>{item.fileName}</TextLink>}
            description={<TimeAgo direction="horizontal" value={item.lastReadAt} surfix="Last view:" defaultContent={<Text strong>Unread</Text>} />}
          />
        </StyledListItem>)}
      />
      {!readonly && <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {canSign && <Button type="primary" block onClick={() => handleSign()} disabled={!canSign}>e-Sign</Button>}
        <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
      </Space>}

    </Space>
  );
};

ReviewSignPage.propTypes = {
  id: PropTypes.string.isRequired
};

ReviewSignPage.defaultProps = {};

export default ReviewSignPage;
