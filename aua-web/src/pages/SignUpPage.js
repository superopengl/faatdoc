import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Modal, Divider } from 'antd';
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
  max-width: 600px;
  // background-color: #f3f3f3;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;


class SignUpPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sending: false,
      shouldShowPasswordConfirm: true,
      initialValues: undefined
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }

  handleSignUp = async (values, isAdmin = false) => {
    if (this.state.sending) {
      return;
    }

    try {
      const { history, location } = this.props;
      this.setState({ sending: true });

      // Sanitize pictures to imageIds
      values.pictures = (values.pictures || []).map(p => _.get(p, 'id', p));
      const user = await signUp(values);

      if (isAdmin) {
        // Admin
        Modal.confirm({
          title: '🎉 Successfully signed up!',
          icon: null,
          // content: <Title level={4} style={{ textAlign: 'center' }}><Text code>{user?.memberId}</Text></Title>,
          onOk() {
            history.go(0);
          },
          okText: 'Create another one',
          onCancel() {
            history.push('/');
          },
        });
        this.setState({ sending: false });
      } else {
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
      }
    } catch (e) {
      console.error(e);
      this.setState({ sending: false });
    }
  }

  validateDob = async (rule, value) => {
    if (!value) return;
    if (value.isAfter()) {
      throw new Error();
    }
  }

  render() {
    const { sending } = this.state;

    return (
      <GlobalContext.Consumer>{
        context => {
          const { role } = context;
          const isAdmin = role === 'admin';

          return (<PageContainer>
            <ContainerStyled>
              <LogoContainer><Logo /></LogoContainer>
              <Title level={2}>User Sign Up</Title>
              {!isAdmin && <Link to="/login"><Button size="small" block type="link">Already a user? Click to log in</Button></Link>}
              <ProfileForm okButtonText="Sign Up" onOk={values => this.handleSignUp(values, isAdmin)} loading={sending} mode="signup"></ProfileForm>
              <Divider />
              <Link to="/"><Button block size="large" type="link">Go to home page</Button></Link>
            </ContainerStyled>
          </PageContainer>);
        }
      }</GlobalContext.Consumer>

    );
  }
}

SignUpPage.propTypes = {};

SignUpPage.defaultProps = {};

export default withRouter(SignUpPage);
