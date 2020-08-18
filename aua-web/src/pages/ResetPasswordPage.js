import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Divider } from 'antd';
import { Logo } from 'components/Logo';
import * as queryString from 'query-string';
import { resetPassword } from 'services/authService';
import { notify } from 'util/notify';

const ContainerStyled = styled.div`
  margin: 2rem auto;
  padding: 2rem 0.5rem;
  text-align: center;
  max-width: 400px;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
class ResetPasswordPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sending: false
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }

  handleSubmit = async values => {
    if (this.state.sending) {
      return;
    }

    try {
      this.setState({ sending: true });
      const { password } = values;
      const { token } = queryString.parse(this.props.location.search);

      await resetPassword(token, password);

      notify.success('Successfully reset password');
      
      // Go back to home page
      this.setState({ sending: false }, () => this.props.history.push('/'));
    } catch (e) {
      this.setState({ sending: false });
    }
  }

  validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator(value) {
        if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }

  render() {
    const { sending } = this.state;

    return (
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={2}>Reset Password</Title>
        <Form layout="vertical" onFinish={this.handleSubmit} style={{ textAlign: 'left' }}>
          <Form.Item label="Password (at least 8 letters)" name="password" rules={[{ required: true,  min: 8, message: ' ' }]}>
            <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} autoFocus={true}/>
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true,  min: 8, message: ' ' }, this.validateConfirmPasswordRule]}>
            <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
          </Form.Item>
          <Form.Item style={{marginTop: '2rem'}}>
            <Button block type="primary" htmlType="submit" disabled={sending}>Reset Password</Button>
            <Button block size="large" type="link" onClick={() => this.goBack()}>Cancel</Button>
          </Form.Item>
        </Form>
        <Divider />
        <Link to="/"><Button block size="large" type="link">Go to home page</Button></Link>
      </ContainerStyled>

    );
  }
}

ResetPasswordPage.propTypes = {};

ResetPasswordPage.defaultProps = {};

export default withRouter(ResetPasswordPage);
