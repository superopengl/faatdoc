import React from 'react';
import styled from 'styled-components';
import { Layout, Typography, AutoComplete, Button, Form, Alert, Space, Modal } from 'antd';
import { impersonate } from 'services/authService';
import HomeHeader from 'components/HomeHeader';
import { GlobalContext } from 'contexts/GlobalContext';
import { listAllUsers } from 'services/userService';
import { reactLocalStorage } from 'reactjs-localstorage';

const ContainerStyled = styled.div`
  margin: 4rem auto 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 300px;
  width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const { Title, Text } = Typography;

const ImpersonatePage = props => {
  const context = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const [userOptions, setUserOptions] = React.useState([]);
  const isAdmin = context.role === 'admin';

  const load = async () => {
    setLoading(true);
    const list = await listAllUsers();
    const options = list.filter(x => x.email !== context.user.email).map(x => ({ value: x.email }));
    setUserOptions(options);
    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, []);

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const { email } = values;

      await impersonate(email);
      reactLocalStorage.clear();

      window.location = '/';
    } catch (e) {
      setLoading(false);
    }
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="User email" name="email" rules={[{ type: 'email', required: true, message: ' ' }]}>
          <AutoComplete placeholder="User email" maxLength="100" disabled={loading} autoFocus={true}
            options={userOptions}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
            }
          />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" disabled={loading}>Impersonate</Button>
        </Form.Item>
      </Space>
    </Form>
  )
}

ImpersonatePage.propTypes = {};

ImpersonatePage.defaultProps = {};

export default ImpersonatePage;
