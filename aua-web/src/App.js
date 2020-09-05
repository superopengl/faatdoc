import React from 'react';
import PropTypes from 'prop-types';

import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import AdminPage from 'pages/AdminPage';
import LogInPage from 'pages/LogInPage';
import ResetPasswordPage from 'pages/ResetPasswordPage';
import MembershipPage from 'pages/MembershipPage';
import { GlobalContext } from './contexts/GlobalContext';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import * as _ from 'lodash';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import SignUpPage from 'pages/SignUpPage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import GalleryPage from 'pages/GalleryPage';
import OtherPage from 'pages/OtherPage';
import ClientsPage from 'pages/ClientsPage';
import MyLodgementListPage from 'pages/MyLodgement/MyLodgementListPage';
import JobAdminPage from 'pages/JobTemplate/JobAdminPage';
import PortofolioPage from 'pages/Portofolio/PortofolioPage';
import AdminLodgementListPage from 'pages/AdminLodgement/AdminLodgementListPage';
import ProceedLodgementPage from 'pages/AdminLodgement/ProceedLodgementPage';
import { getAuthUser } from 'services/authService';
import { Spin } from 'antd';
import {RoleRoute} from 'components/RoleRoute';
import MyLodgementPage from 'pages/MyLodgement/MyLodgementPage';
import RecurringListPage from 'pages/Recurring/RecurringListPage';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      role: 'guest',
      loading: true,
      setUser: this.setUser,
      setLoading: this.setLoading,
    };
  }

  async componentDidMount() {
    this.setLoading(true);
    const user = await getAuthUser();
    if (user) {
      this.setUser(user);
    }
    this.setLoading(false);
  }

  setUser = (user) => {
    this.setState({ user, role: user ? user.role : 'guest' });
  }

  setLoading = (value) => {
    this.setState({ loading: !!value });
  }

  render() {
    const { role, loading } = this.state;
    const isAdmin = role === 'admin';
    const isGuest = role === 'guest';
    const isClient = role === 'client';
    const isAgent = role === 'agent';

    return (
      <GlobalContext.Provider value={this.state}>
        <BrowserRouter basename="/">
          <Switch>
            <RoleRoute loading={loading} path="/" exact component={HomePage} />
            <RoleRoute visible={isGuest} loading={loading} path="/login" exact component={LogInPage} />
            <RoleRoute visible={isAdmin || isGuest} loading={loading} path="/signup" component={SignUpPage} />
            <RoleRoute loading={loading} path="/forgot_password" exact component={ForgotPasswordPage} />
            <RoleRoute visible={isClient} loading={loading} path="/portofolio" component={PortofolioPage} />
            <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
            <RoleRoute visible={isAdmin} loading={loading} path="/admin" exact component={AdminPage} />
            <RoleRoute visible={isAdmin} loading={loading} path="/job_template" exact component={JobAdminPage} />
            <RoleRoute visible={isAdmin} loading={loading} path="/recurring" exact component={RecurringListPage} />
            <RoleRoute visible={isAdmin} loading={loading} path="/clients" exact component={ClientsPage} />
            <RoleRoute visible={isAdmin} loading={loading} path="/tasks" exact component={ClientsPage} />
            <RoleRoute visible={isClient} loading={loading} path="/lodgement/:id" exact component={MyLodgementPage} />
            <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/lodgement" exact component={isClient ? MyLodgementListPage : AdminLodgementListPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} path="/lodgement/:id/proceed" exact component={ProceedLodgementPage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/change_password" exact component={ChangePasswordPage} />
            <RoleRoute loading={loading} path="/terms_and_conditions" exact component={TermAndConditionPage} />
            <RoleRoute loading={loading} path="/privacy_policy" exact component={PrivacyPolicyPage} />
            {/* <Redirect to="/" /> */}
            <RoleRoute loading={loading} component={Error404} />

          </Switch>
        </BrowserRouter>
      </GlobalContext.Provider>
    );
  }
}

export default App;
