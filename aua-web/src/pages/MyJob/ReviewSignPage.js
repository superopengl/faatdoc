import { Button, List, Space, Typography, Form, Checkbox } from 'antd';
import Text from 'antd/lib/typography/Text';
import { FileIcon } from 'components/FileIcon';
import { TimeAgo } from 'components/TimeAgo';
import PropTypes from 'prop-types';
import React from 'react';
import { searchFile } from 'services/fileService';
import { getJob, signJob } from 'services/jobService';
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
  const { value, onOk } = props;

  const job = value;
  const [loading, setLoading] = React.useState(true);
  const [files, setFiles] = React.useState([]);


  const getSignFiles = async (job) => {
    const fileids = job?.fields?.find(x => x.name === 'requireSign')?.value || [];
    if (!fileids.length) return [];

    const files = await searchFile(fileids);
    return files
  }

  const loadEntity = async () => {
    setLoading(true);
    const files = await getSignFiles(job);
    setFiles(files);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  const handleSign = async () => {
    await signJob(job.id);
    onOk();
  }

  const { status } = job || {};

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
      {/* {!readonly && <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {canSign && <Button type="primary" block onClick={() => handleSign()} disabled={!canSign}>e-Sign</Button>}
        <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
      </Space>} */}
      {canSign && <Form onFinish={handleSign}>
        <Form.Item name="" valuePropName="checked" rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox>I have read and agree on the <a href="/disclaimer" target="_blank">disclaimer</a></Checkbox>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" block disabled={!canSign}>e-Sign</Button>
        </Form.Item>
      </Form>}
    </Space>
  );
};

ReviewSignPage.propTypes = {
  id: PropTypes.string
};

ReviewSignPage.defaultProps = {};

export default ReviewSignPage;
