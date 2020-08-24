import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import AdminPage from 'pages/AdminPage';
import LogInPage from 'pages/LogInPage';
import ResetPasswordPage from 'pages/ResetPasswordPage';
import MembershipPage from 'pages/MembershipPage';
import { GlobalContext } from './contexts/GlobalContext';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import { loadFromLocalStorage, saveLocalStorage } from 'services/localStorageService';
import * as _ from 'lodash';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import SignUpPage from 'pages/SignUpPage';
import ProfilePage from 'pages/ProfilePage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import GalleryPage from 'pages/GalleryPage';
import OtherPage from 'pages/OtherPage';
import ClientsPage from 'pages/ClientsPage';
import MyLodgementPage from 'pages/MyLodgement/MyLodgementPage';
import JobAdminPage from 'pages/JobTemplate/JobAdminPage';
import PortofolioPage from 'pages/Portofolio/PortofolioPage';
import AdminLodgementPage from 'pages/AdminLodgement/AdminLodgementPage';


class App extends React.Component {
  constructor(props) {
    super(props);

    const user = loadFromLocalStorage('user');
    const profile = loadFromLocalStorage('profile');

    this.state = {
      user,
      role: _.get(user, 'role', 'guest'),
      profile,
      loading: false,
      setUser: this.setUser,
      setProfile: this.setProfile,
      setLoading: this.setLoading,
    };
  }

  setUser = (user) => {
    saveLocalStorage('user', user);
    this.setState({ user, role: user ? user.role : 'guest' });
  }

  setProfile = (profile) => {
    saveLocalStorage('profile', profile);
    this.setState({ profile });
  }

  setLoading = (value) => {
    this.setState({ loading: !!value });
  }

  render() {
    const { role } = this.state;
    const isAdmin = role === 'admin';
    const isGuest = role === 'guest';
    const isClient = role === 'client';
    const isAgent = role === 'agent';

    return (
      <GlobalContext.Provider value={this.state}>
        <BrowserRouter basename="/">
          <Switch>
            <Route path="/" exact component={HomePage} />
            {isGuest && <Route path="/login" exact component={LogInPage} />}
            {(isAdmin || isGuest) && <Route path="/signup" component={SignUpPage} />}
            {isClient && <Route path="/portofolio" component={PortofolioPage} />}
            <Route path="/forgot_password" exact component={ForgotPasswordPage} />
            <Route path="/reset_password" exact component={ResetPasswordPage} />
            {isAdmin && <Route path="/admin" exact component={AdminPage} />}
            {isAdmin && <Route path="/job_template" exact component={JobAdminPage} />}
            {isAdmin && <Route path="/clients" exact component={ClientsPage} />}
            {isAdmin && <Route path="/tasks" exact component={ClientsPage} />}
            {isClient && <Route path="/lodgement" exact component={MyLodgementPage} />}
            {(isAdmin || isAgent) && <Route path="/lodgement" exact component={AdminLodgementPage} />}
            {!isGuest && <Route path="/change_password" exact component={ChangePasswordPage} />}
            <Route path="/terms_and_conditions" exact component={TermAndConditionPage} />
            <Route path="/privacy_policy" exact component={PrivacyPolicyPage} />
            <Route component={OtherPage} />
            {/* {(isMember || isAdmin) && <Route component={Error404} />} */}
          </Switch>
        </BrowserRouter>
      </GlobalContext.Provider>
    );
  }
}

export default App;
