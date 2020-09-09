import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Drawer, Table, Input, Modal, Form, Tooltip } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  DeleteOutlined, SafetyCertificateOutlined, CaretRightFilled, PlusOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { List } from 'antd';
import { Space } from 'antd';

import { listLodgement, searchLodgement, assignLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import { AutoComplete } from 'antd';
import { listAgents, listAllUsers, deleteUser, setPasswordForUser } from 'services/userService';
import Highlighter from "react-highlight-words";
import ReviewSignPage from 'pages/MyLodgement/ReviewSignPage';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { listRecurring, deleteRecurring, runRecurring } from 'services/recurringService';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { notify } from 'util/notify';
import cronstrue from 'cronstrue';
import * as cronParser from 'cron-parser';

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

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  total: 0,
  status: ['submitted', 'to_sign', 'signed'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const UserPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();

  const columnDef = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text, record) => text,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text, record) => text
    },
    {
      title: 'Last Logged In At',
      dataIndex: 'lastLoggedInAt',
      render: (text, record) => <TimeAgo value={text} />,
    },
    {
      title: 'Last Action At',
      dataIndex: 'lastNudgedAt',
      render: (text, record) => <TimeAgo value={text} />,
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => {
        return (
          <Space size="small" style={{ width: '100%' }}>
            <Tooltip placement="bottom" title="Reset password">
              <Button shape="circle" icon={<SafetyCertificateOutlined />} onClick={e => openSetPasswordModal(e, record)} />
            </Tooltip>
            {record.email !== 'admin@auao.com.au' && <Tooltip placement="bottom" title="Delete user">
              <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
            </Tooltip>}
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    setLoading(true);
    const list = await listAllUsers();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, email } = item;
    Modal.confirm({
      title: <>To delete user <strong>{email}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteUser(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const openSetPasswordModal = async (e, item) => {
    e.stopPropagation();
    setSetPasswordVisible(true);
    setCurrentUser(item);
  }

  const handleSetPassword = async (id, values) => {
    setLoading(true);
    await setPasswordForUser(id, values.password);
    setSetPasswordVisible(false);
    setCurrentUser(undefined);
    setLoading(false);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>User Management</Title>
          </StyledTitleRow>

          {/* <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Recurring</Button>
          </Space> */}

          <Table columns={columnDef}
            dataSource={list}
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={false}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          // onRow={(record, index) => ({
          //   onDoubleClick: e => {
          //     setCurrentId(record.id);
          //     setFormVisible(true);
          //   }
          // })}
          />
        </Space>
      </ContainerStyled>
      <Modal
        visible={setPasswordVisible}
        destroyOnClose={true}
        maskClosable={true}
        onOk={() => setSetPasswordVisible(false)}
        onCancel={() => setSetPasswordVisible(false)}
        title={<>Set Password</>}
        footer={null}
        width={400}
      >
        <Form layout="vertical" onFinish={values => handleSetPassword(currentUser?.id, values)}>
          <Space style={{ justifyContent: 'center', width: '100%' }}>
            <Paragraph code>{currentUser?.email}</Paragraph>
          </Space>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: ' ' }]}>
            <Input placeholder="New password" autoComplete="new-password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Set Password</Button>

          </Form.Item>
        </Form>
      </Modal>
    </LayoutStyled >

  );
};

UserPage.propTypes = {};

UserPage.defaultProps = {};

export default withRouter(UserPage);
