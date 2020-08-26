import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import ProfileForm from 'components/forms/ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import * as _ from 'lodash';
import { saveProfile, getProfile } from 'services/userService';
import { notify } from 'util/notify';

const { Title } = Typography;

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 4rem 0;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 700px;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

class ProfilePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sending: false,
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }



  validateDob = async (rule, value) => {
    if (!value) return;
    if (value.isAfter()) {
      throw new Error();
    }
  }

  render() {
    return (
      <GlobalContext.Consumer>
        {
          context => {
            const { role, user, profile, setProfile } = context;
            const { sending } = this.state;

            const handleSave = async values => {
              if (this.state.sending) {
                return;
              }
          
              try {
                this.setState({ sending: true });
          
                await saveProfile(values);
          
                notify.success( 'Successfully saved profile changes!');

                const newProfile = await getProfile();
                setProfile(newProfile);
              } finally {
                this.setState({ sending: false });
              }
            }

            const initialValues = {
              ...profile, 
              email: user.email
            };

            return <LayoutStyled>
              <HomeHeader></HomeHeader>
              <PageContainer>
                <ContainerStyled>
                  <Title level={2}>User Profile</Title>
                  <ProfileForm okButtonText="Save Change" mode="profile" initialValues={initialValues} role={role} onOk={handleSave} loading={sending} />
                </ContainerStyled>
              </PageContainer>
            </LayoutStyled>
          }
        }
      </GlobalContext.Consumer>

    );
  }
}

ProfilePage.propTypes = {};

ProfilePage.defaultProps = {};

export default withRouter(ProfilePage);
