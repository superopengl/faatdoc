import React from 'react';
import styled from 'styled-components';
import { Layout, Menu, Drawer, Button, Modal, Typography } from 'antd';
import MediaQuery from 'react-responsive'
import {
  MenuOutlined, HomeOutlined, MailOutlined, SmileOutlined, PictureOutlined,
  BellOutlined, SettingOutlined,
  IdcardOutlined, UserOutlined, LogoutOutlined, SecurityScanOutlined,
  LoginOutlined, TeamOutlined, SnippetsOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Logo } from './Logo';
import { GlobalContext } from '../contexts/GlobalContext'
import { logout } from 'services/authService';
import { PortofolioAvatar } from './PortofolioAvatar';
import { Avatar } from 'antd';
import { Badge } from 'antd';
import { getNotificationCount } from 'services/notificationService';

const { Title, Text } = Typography;
const { Header } = Layout;
const HeaderStyled = styled(Header)`
position: fixed;
z-index: 1;
width: 100%;
// background-color: rgba(255,255,255,0.8);
background-color: rgba(255,255,255);
display: flex;
white-space: nowrap;
border: 0;
justify-content: space-between;
border-bottom: 1px solid #f0f0f0;
align-items: center;
box-shadow: 0px 2px 8px #888888;
padding-left: 20px;
padding-right: 20px;

`;

const MenuContianer = styled.div`
float: right;
// border: 0;
margin-bottom: 2px;
`;


const headerHeight = 64;

const HeaderLogo = styled.div`
display: flex;
height: ${headerHeight}px;
`

const HomeHeaderRaw = props => {
  const [visible, setVisible] = React.useState(false);
  const [notificationNumber, setNotificationNumber] = React.useState(0);

  React.useEffect(() => {
    setNotificationNumber(getNotificationCount());
  });

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const history = props.history;

  return (
    <GlobalContext.Consumer>
      {
        context => {
          const { role, setUser, user } = context;
          const isAdmin = role === 'admin';
          const isClient = role === 'client';
          const isAgent = role === 'agent';
          const isGuest = role === 'guest';

          const handleLogout = () => {
            Modal.confirm({
              title: <>Do you want to log out?</>,
              icon: null,
              // content: 'Some descriptions',
              async onOk() {
                await logout();
                setUser(null);
                history.push('/');
              },
              maskClosable: true,
              okText: 'Yes, log me out!',
              onCancel() {
              },
            });
          }
          return (
            <HeaderStyled>
              <HeaderLogo>
                <HashLink to="/">
                  <img alt="AUA logo" src="/images/header-logo.png" width="auto" height="60" style={{ padding: '2px 0 2px 0' }}></img>
                </HashLink>
                {/* {isAdmin && <Text>Admin</Text>} */}
              </HeaderLogo>
              <MediaQuery minDeviceWidth={801}>
                <MenuContianer>
                  <Menu mode="horizontal" style={{ border: 0 }}>
                    {isGuest && <Menu.Item key="home"><HashLink to="/#home">Home</HashLink></Menu.Item>}
                    {isGuest && <Menu.Item key="services"><HashLink to="/#services">Services</HashLink></Menu.Item>}
                    {isGuest && <Menu.Item key="team"><HashLink to="/#team">Team</HashLink></Menu.Item>}
                    {isGuest && <Menu.Item key="login"><Link to="/login">Log In / Sign Up</Link></Menu.Item>}
                    {!isGuest && <Menu.Item key="lodgement"><Link to="/lodgement">Lodgement</Link></Menu.Item>}
                    {isClient && <Menu.Item key="portofolio"><Link to="/portofolio">Portofolio</Link></Menu.Item>}
                    {isAdmin && <Menu.Item key="clients"><Link to="/clients">Users</Link></Menu.Item>}
                    {/* {isAdmin && <Menu.Item key="admin"><Link to="/admin">Admin</Link></Menu.Item>} */}
                    {isAdmin && <Menu.Item key="job_template"><Link to="/job_template">Job Template</Link></Menu.Item>}
                    {isAdmin && <Menu.Item key="recurring"><Link to="/recurring">Recurring</Link></Menu.Item>}
                    {!isGuest && <Menu.Item key="notification"><Link to="/notification"><Badge count={notificationNumber} showZero={false} offset={[10, 0]}>Notification</Badge></Link></Menu.Item>}
                    {!isGuest && <Menu.SubMenu key="user" title={<Avatar size={40} icon={<UserOutlined style={{ fontSize: 20 }} />} style={{ backgroundColor: '#143e86' }} />}>
                      <Menu.Item key="changePassword"><Link to="/change_password">Change Password</Link></Menu.Item>
                      <Menu.Item key="logout" onClick={handleLogout}>Log Out</Menu.Item>
                    </Menu.SubMenu>}
                  </Menu>

                </MenuContianer>
                {/* <Tag>{user?.memberId}</Tag> */}
              </MediaQuery>
              <MediaQuery maxDeviceWidth={800}>
              <Badge count={notificationNumber} showZero={false} ><Button type="default" onClick={showDrawer}>
                  <MenuOutlined />
                </Button></Badge>
                <Drawer
                  placement="right"
                  closable={true}
                  onClose={onClose}
                  visible={visible}
                  width={290}
                  bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <Menu mode="inline" style={{ border: 0 }} openKeys={['gallery']}>
                    {isGuest && <Menu.Item key="login"><LoginOutlined /> <Link to="/login">Log In / Sign Up</Link></Menu.Item>}
                    {/* {isAdmin && <Menu.Item key="admin"><SettingOutlined /> <Link to="/admin">Admin</Link></Menu.Item>} */}
                    {!isGuest && <Menu.Item key="lodgement"><SnippetsOutlined /> <Link to="/lodgement">Lodgement</Link></Menu.Item>}
                    {isClient && <Menu.Item key="portofolio"><IdcardOutlined /> <Link to="/portofolio">Portofolio</Link></Menu.Item>}
                    {isAdmin && <Menu.Item key="job_template"><SettingOutlined /> <Link to="/job_template">Job Template</Link></Menu.Item>}
                    {isAdmin && <Menu.Item key="recurring"><SettingOutlined /> <Link to="/recurring">Recurring</Link></Menu.Item>}
                    {isAdmin && <Menu.Item key="clients"><SettingOutlined /> <Link to="/clients">Users</Link></Menu.Item>}
                    {!isGuest && <Menu.Item key="notification"><MailOutlined /> <Link to="/notification">Notification <Badge count={notificationNumber} showZero={false} /></Link></Menu.Item>}
                    {!isGuest && <Menu.Item key="changePassword"><SecurityScanOutlined /> <Link to="/change_password">Change Password</Link></Menu.Item>}
                    {isGuest && <Menu.Item key="home"><HomeOutlined /> <HashLink to="/#home" onClick={onClose}>Home</HashLink></Menu.Item>}
                    {isGuest && <Menu.Item key="services"><BellOutlined /> <HashLink to="/#services" onClick={onClose}>Services</HashLink></Menu.Item>}
                    {isGuest && <Menu.Item key="team"><TeamOutlined /> <HashLink to="/#team" onClick={onClose}>Team</HashLink></Menu.Item>}
                    {!isGuest && <Menu.Item key="logout" onClick={handleLogout}><LogoutOutlined />{isAdmin ? 'Admin ' : isAgent ? 'Agent ' : null}Log Out</Menu.Item>}
                  </Menu>
                </Drawer>
              </MediaQuery>

            </HeaderStyled>
          );
        }
      }
    </GlobalContext.Consumer>
  )
}

HomeHeaderRaw.propTypes = {};

HomeHeaderRaw.defaultProps = {};

export const HomeHeader = withRouter(HomeHeaderRaw);

export default HomeHeader;
