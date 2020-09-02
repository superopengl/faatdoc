import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Modal, Divider, Form, Radio, Input, Checkbox } from 'antd';
import { Logo } from 'components/Logo';
import * as queryString from 'query-string';
import { signUp } from 'services/authService';
import ProfileForm from 'components/forms/ProfileForm';
import * as _ from 'lodash';
import { GlobalContext } from 'contexts/GlobalContext';
const { Title, Text } = Typography;

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 500px;
  // background-color: #f3f3f3;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;

  label {
    width: 50%;
    text-align: center;
  }
`;


const SignUpPage = (props) => {

  const [sending, setSending] = React.useState(false);

  const goBack = () => {
    props.history.goBack();
  }

  const handleSignUp = async (values) => {
    if (sending) {
      return;
    }

    try {
      const { history, location } = props;
      setSending(true);

      // Sanitize pictures to imageIds
      values.role = values.isEmployee ? 'agent' : 'client';
      const user = await signUp(values);

      // Guest
      Modal.confirm({
        title: '🎉 Successfully signed up!',
        icon: null,
        content: <>
          <p>
            Congratulations and thank you very much for signing up AUA Allied. Your registration email is <strong>{user?.email}</strong>.
          </p>
          <p>
            You can login with either the registration email anytime.
          </p>
        </>,
        onOk() {
          history.push('/login');
        },
        okText: 'Go To log in',
        onCancel() {
          history.push('/');
        },
        cancelText: 'Go to home page'
      });
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  }

  const validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator() {
        if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }


  return (
    <GlobalContext.Consumer>{
      context => {
        const { role } = context;

        return (<PageContainer>
          <ContainerStyled>
            <LogoContainer><Logo /></LogoContainer>
            <Title level={2}>Sign Up</Title>
            <Form layout="vertical" onFinish={handleSignUp} style={{ textAlign: 'left' }} initialValues={{ role: 'client' }}>
              <Form.Item>
                <Link to="/login"><Button size="small" block type="link">Already a user? Click to log in</Button></Link>
              </Form.Item>

              <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
                <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
              </Form.Item>
              <Form.Item label="Password (at least 8 letters)" name="password" rules={[{ required: true, min: 8, message: ' ' }]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
              </Form.Item>
              <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, validateConfirmPasswordRule]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
              </Form.Item>
              <Form.Item label="" name="agreement" valuePropName="checked" style={{marginBottom: 0}} rules={[{
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
              }]}>
                <Checkbox disabled={sending}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
              </Form.Item>
              {/* <Form.Item label="" name="isEmployee" rules={[{ required: false }]}>
                <Checkbox disabled={sending}>I am an employee of AU Accounting Office</Checkbox>
              </Form.Item> */}
              <Form.Item>
                <Button block type="primary" htmlType="submit" disabled={sending}>Sign Up</Button>
              </Form.Item>
              <Form.Item>
                <Button block type="link" onClick={() => goBack()}>Cancel</Button>
              </Form.Item>
            </Form>
            <Divider />
            <Link to="/"><Button block type="link">Go to home page</Button></Link>
          </ContainerStyled>
        </PageContainer>);
      }
    }</GlobalContext.Consumer>

  );
}

SignUpPage.propTypes = {};

SignUpPage.defaultProps = {};

export default withRouter(SignUpPage);
