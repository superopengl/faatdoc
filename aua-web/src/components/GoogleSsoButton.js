

import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login, ssoGoogle } from 'services/authService';
import { refreshNotificationUnreadCount } from 'services/notificationService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';

const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;
  const {render} = props;

  const handleGoogleSso = async (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if(error || !tokenId) {
      return;
    }
    const user = await ssoGoogle(tokenId);
    if (user) {
      setUser(user);

      const count = await refreshNotificationUnreadCount();
      setNotifyCount(count);
      
      props.history.push('/lodgement');
    } else {
      notify.error('Failed to log in with Google');
    }
  }

  return <GoogleLogin
    clientId={process.env.REACT_APP_AUA_GOOGLE_SSO_CLIENT_ID}
    buttonText="Log In with Google"
    // isSignedIn={true}
    render={render}
    style={{width: '100%'}}
    icon={true}
    onSuccess={handleGoogleSso}
    onFailure={handleGoogleSso}
  // cookiePolicy={'single_host_origin'}
  />
}

export default withRouter(GoogleSsoButton);