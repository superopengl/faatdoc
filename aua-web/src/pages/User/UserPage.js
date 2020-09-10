import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  DeleteOutlined, SafetyCertificateOutlined, PlusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { listAllUsers, deleteUser, setPasswordForUser } from 'services/userService';
import { inviteUser } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';

const { Title, Paragraph } = Typography;

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



const UserPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);

  const columnDef = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text) => text,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text) => text
    },
    {
      title: 'Last Logged In At',
      dataIndex: 'lastLoggedInAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      title: 'Last Action At',
      dataIndex: 'lastNudgedAt',
      render: (text) => <TimeAgo value={text} />,
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

  const handleNewUser = () => {
    setInviteVisible(true);
  }

  const handleInviteUser = async values => {
    const {email} = values;
    await inviteUser(email);
    setInviteVisible(false);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>User Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={() => handleNewUser()} icon={<PlusOutlined />}>Invite User</Button>
          </Space>
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
      <Modal
        visible={inviteVisible}
        destroyOnClose={true}
        maskClosable={true}
        onOk={() => setInviteVisible(false)}
        onCancel={() => setInviteVisible(false)}
        title={<>Invite User</>}
        footer={null}
        width={500}
      >
        <Paragraph>System will send an invitation to the email address if the email address isn't a sign up user.</Paragraph>
        <Form layout="vertical" onFinish={handleInviteUser}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
    </LayoutStyled >

  );
};

UserPage.propTypes = {};

UserPage.defaultProps = {};

export default withRouter(UserPage);
