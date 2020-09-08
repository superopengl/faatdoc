import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Modal, Divider, Checkbox } from 'antd';
import { LargePlusButton } from 'components/LargePlusButton';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  ExclamationCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { List } from 'antd';
import { Space } from 'antd';
import LodgementForm from './MyLodgementForm';
import LodgementCard from './MyLodgementCard';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { deleteLodgement, generateLodgement, getLodgement, saveLodgement, signLodgement } from 'services/lodgementService';
import { searchFile, downloadFile } from 'services/fileService';
import { FileIcon } from 'components/FileIcon';
import { TimeAgo } from 'components/TimeAgo';

const { Title, Paragraph, Link: TextLink } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const StyledFileIcon = styled.div`
  width: 40px;
  height: 50px;
  display: inline-block;
`;

const StyledListItem = styled(List.Item)`
  cursor: pointer;

  // &:hover {
  //   background-color: rgba(0,0,0,0.1);
  // }

`;

const ReviewSignPage = (props) => {
  const { id, readonly } = props;

  const [loading, setLoading] = React.useState(true);
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

  const handleViewFile = async (item) => {
    const {id, fileName} = item;
    const data = await downloadFile(id);
    // console.log(data);
    const blob = new Blob([data], { type: 'text/csv,charset=utf-8' });
    saveAs(blob, fileName);

    await loadEntity();
  }
  const { status, name } = lodgement || {};

  const canSign = files.every(f => !!f.lastReadAt);

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
            title={<TextLink strong={!item.lastReadAt} href={`/lodgement/download/${item.id}`} target="_blank">{item.fileName}</TextLink>}
            description={<TimeAgo direction="horizontal" value={item.lastReadAt} surfix="Last view:" defaultContent={<Text strong>Unread</Text>} />}
          />
        </StyledListItem>)}
      />
      {!readonly && <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {canSign ? <Text>All above documents have been viewed and the lodgement is ready to e-sign.</Text> : <Text type="warning">Please view all above documents before sign.</Text>}
        <Button type="primary" block onClick={() => handleSign()} disabled={!canSign}>e-Sign</Button>
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
