import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Row, Col, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login } from 'services/authService';
import { getProfile } from 'services/userService';
import { HashLink } from 'react-router-hash-link';
import windowSize from 'react-window-size';


const ContainerStyled = styled.div`
  margin: 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
class LogInPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sending: false
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }

  validateName = async (rule, value) => {
    const isValid = value && (isEmail(value) || /(ME|BU)[0-9]{4}/i.test(value) || /admin/i.test(value));
    if (!isValid) {
      throw new Error();
    }
  }

  render() {
    const { sending } = this.state;

    const span = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12,
    }
    return (
      <GlobalContext.Consumer>
        {
          context => {
            const { setUser, setProfile } = context;
            const { windowHeight } = this.props;
            const shouldShowSignUpLink = windowHeight < 800;

            const handleSubmit = async values => {
              if (this.state.sending) {
                return;
              }

              try {
                this.setState({ sending: true });

                const user = await login(values.name, values.password);
                setUser(user);

                const profile = await getProfile();
                setProfile(profile);

                this.props.history.push(user.role === 'admin' ? '/tasks' : '/requests');
              } catch {
                this.setState({ sending: false });
              }
            }

            return (
              <ContainerStyled>
                <LogoContainer><Logo /></LogoContainer>
                <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
                  <Form.Item label="Email" name="name"
                    rules={[{ required: true, validator: this.validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
                  >
                    <Input placeholder="abc@xyz.com" autoComplete="email" allowClear={true} maxLength="100" disabled={sending} autoFocus={true} />
                  </Form.Item>
                  <Form.Item label="Password" name="password" autoComplete="current-password" rules={[{ required: true, message: 'Please input password' }]}>
                    <Input.Password placeholder="Password" maxLength="50" disabled={sending} />
                  </Form.Item>
                  <Form.Item>
                    <Button block type="primary" htmlType="submit" disabled={sending}>Log In</Button>
                  </Form.Item>
                  <Form.Item>
                    <Button ghost block type="primary" icon={<GoogleOutlined />}>Log In with Google</Button>
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
            );
          }
        }

      </GlobalContext.Consumer>
    );
  }
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default windowSize(withRouter(LogInPage));
