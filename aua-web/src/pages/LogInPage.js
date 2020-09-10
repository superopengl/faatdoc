import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login, ssoGoogle } from 'services/authService';
import { refreshNotificationUnreadCount } from 'services/notificationService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';

const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const LogInPage = props => {
  const [sending, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;

  const goBack = () => {
    props.history.goBack();
  }

  const validateName = async (rule, value) => {
    const isValid = value && isEmail(value);
    if (!isValid) {
      throw new Error();
    }
  }

  const handleAfterSuccessfulLogin = async (user) => {
    setUser(user);

    const count = await refreshNotificationUnreadCount();
    setNotifyCount(count);

    props.history.push('/lodgement');
  }

  const handleGoogleSso = async (response) => {
    console.log('Google sso', response);
    const { profileObj, tokenId } = response;
    const { email } = profileObj || {};
    if (email) {
      const user = await ssoGoogle(email, tokenId);
      await handleAfterSuccessfulLogin(user);
    } else {
      notify.error('Failed to log in with Google');
    }
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);

      const user = await login(values.name, values.password);
      await handleAfterSuccessfulLogin(user);
    } catch {
      setLoading(false);
    }
  }

  return (
    <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={2}>Log In</Title>
        <Link to="/signup"><Button size="small" block type="link">Not a user? Click to sign up</Button></Link>

        <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
          <Form.Item label="Email" name="name"
            rules={[{ required: true, validator: validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
          >
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={sending} autoFocus={true} />
          </Form.Item>
          <Form.Item label="Password" name="password" autoComplete="current-password" rules={[{ required: true, message: 'Please input password' }]}>
            <Input.Password placeholder="Password" autoComplete="current-password" maxLength="50" disabled={sending} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={sending}>Log In</Button>
          </Form.Item>
          <Form.Item>
            <GoogleLogin
              clientId="1036301846271-e8sto3acfpcd06mgbl7e4tl5cdfanqjm.apps.googleusercontent.com"
              // buttonText="Log In with Google"
              // isSignedIn={true}
              render={renderProps => (
                <Button ghost block type="primary"
                  icon={<GoogleOutlined />}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >Log In with Google</Button>
              )}
              onSuccess={handleGoogleSso}
              onFailure={handleGoogleSso}
            // cookiePolicy={'single_host_origin'}
            />
          </Form.Item>
          <Form.Item>
            <Link to="/signup"><Button ghost block type="primary">Sign Up</Button></Link>
          </Form.Item>
          <Form.Item>
            <Link to="/forgot_password">
              <Button block type="link">Forgot password? Click here to reset</Button>
            </Link>
            <Link to="/"><Button block type="link">Go to home page</Button></Link>
          </Form.Item>
        </Form>
      </ContainerStyled>
    </LayoutStyled>
  );
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default withRouter(LogInPage);
