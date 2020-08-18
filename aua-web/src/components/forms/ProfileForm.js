import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Radio, DatePicker, Checkbox } from 'antd';
import { ProfilePictureUploader } from '../ProfilePictureUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`

class ProfileForm extends React.Component {

  goBack = () => {
    this.props.history.goBack();
  }

  handleSubmit = async values => {
    if (values.dob) {
      values.dob = values.dob.utc().format('YYYY-MM-DD');
    }
    await this.props.onOk(values);
  }

  validateDob = async (rule, value) => {
    if (!value) return;
    if (value.isAfter()) {
      throw new Error();
    }
  }

  validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator() {
        if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }

  render() {
    const { mode, initialValues, type, loading } = this.props;
    const isBusiness = type === 'business';
    const isIndividual = type === 'individual';
    if (!isBusiness && !isIndividual) throw new Error(`Member type ${type} is invalid`);
    const isSignUp = mode === 'signup';
    const isEditProfile = mode === 'profile';

    const formInitValues = {
      ...initialValues,
      dob: initialValues && initialValues.dob ? moment(initialValues.dob) : undefined
    };

    const isEmailDisable = isEditProfile || loading;

    return (
      <GlobalContext.Consumer>{
        context => {
          const { role } = context;
          const isAdmin = role === 'admin';
          const canInputMemberId = isAdmin && isSignUp;

          return (<Form layout="vertical" onFinish={this.handleSubmit} style={{ textAlign: 'left' }} initialValues={formInitValues}>
            {canInputMemberId && <StyledFormItem label="Member ID (in format of ME0000 or BU0000)" name="memberId" rules={[{ required: true, pattern: /(ME|BU)[0-9]{4}/i, whitespace: true, max: 6, message: ' ' }]}>
              <Input placeholder="ME0000 or BU0000" allowClear={true} maxLength="6" disabled={loading} />
            </StyledFormItem>}
            <StyledFormItem label="Email" name="email" rules={[{ required: isSignUp, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={isEmailDisable} autoFocus={true} />
            </StyledFormItem>
            <StyledFormItem label={isBusiness ? "Business Name 店名" : 'Full Name 姓名'} name="name" rules={[{ required: isSignUp, whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="" allowClear={true} autoComplete="username" maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label={isBusiness ? "Other Name" : 'Preferred Name 常用名'} name="secondaryName" rules={[{ required: false, whitespace: true, max: 100 }]}>
              <Input placeholder={isBusiness ? "Other name than English, like 中文的店名" : ''} allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            {isIndividual && <>
              <StyledFormItem label="Sex 性别" name="gender" rules={[{ required: true, message: 'Please choose a gender' }]}>
                <Radio.Group buttonStyle="solid">
                  <Radio style={{ display: 'block', height: '2rem' }} value="male">Male</Radio>
                  <Radio style={{ display: 'block', height: '2rem' }} value="female">Female</Radio>
                  <Radio style={{ display: 'block', height: '2rem' }} value="secret">Prefer not to say</Radio>
                  <Radio style={{ display: 'block', height: '2rem' }} value="other">Other</Radio>
                </Radio.Group>
              </StyledFormItem>
              <StyledFormItem label="Date of Birth (DOB) 生日" name="dob" rules={[{ required: false, validator: this.validateDob, message: 'Invalid date or not a past date' }]}>
                <DatePicker placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" onChange={() => { }} />
              </StyledFormItem>
            </>}
            <StyledFormItem label={isBusiness ? "Business Phone 联系电话" : 'Mobile 手机号码'} name="phone" rules={[{ required: true, message: ' ' }]}>
              <Input placeholder="" type="tel" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Your Referral Friend's name 推荐人" name="referrer" rules={[{ required: true, message: ' ' }]}>
              <Input placeholder="Referrer full name or memeber ID eg. ME0000 or BU0000" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Select Your Director for Approval" name="approvalDirector" rules={[{ required: true, message: 'Please select a director for approval' }]}>
              <Radio.Group buttonStyle="solid">
                <Radio style={{ display: 'block', height: '2rem' }} value="maxx">Maxx (Founder) 04 1034 4808</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="benson.yi">Benson YI (Marketing Director) 04 2678 5838</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="kevin.lo">Kevin Lo (Director, Accountant) 04 2234 4651</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="eddie.hui">Eddie HUI (Director) 04 1152 1173</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="david.chiam">David CHIAM (Director) 04 8022 6363</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="ode">Ode (Director) 04 2521 3716</Radio>
              </Radio.Group>
            </StyledFormItem>
            {isBusiness && <StyledFormItem label="Contact Person Details 联系人资料" name="contact" rules={[{ required: true, message: ' ' }]}>
              <Input placeholder="Owner's or manager's full name, mobile number, Email, WeChat ID, Facebook, and/or Instagram, etc" allowClear={true} maxLength="300" disabled={loading} />
            </StyledFormItem>}
            {isBusiness && <StyledFormItem label="Business Address 地址 (Multiple)" name="address" rules={[{ required: true, message: ' ' }]}>
              <Input.TextArea autoSize placeholder="One address per line" allowClear={true} maxLength="500" disabled={loading} />
            </StyledFormItem>}
            {isBusiness && <StyledFormItem label="Website 网页" name="website" rules={[{ required: false, max: 1000, message: ' ' }]}>
              <Input placeholder="https://" allowClear={true} maxLength="1000" disabled={loading} />
            </StyledFormItem>}
            {isIndividual && <>
              <StyledFormItem label="WeChat ID 微信号" name="wechat" rules={[{ required: false, max: 50, message: ' ' }]}>
                <Input placeholder="" allowClear={true} maxLength="50" disabled={loading} />
              </StyledFormItem>
            </>}
            <StyledFormItem label="Facebook 脸书" name="facebook" rules={[{ required: false, max: 1000, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="1000" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Instagram" name="instagram" rules={[{ required: false, max: 1000, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="1000" disabled={loading} />
            </StyledFormItem>
            {isIndividual && <>
              <StyledFormItem label="Skype" name="skype" rules={[{ required: false, max: 50, message: ' ' }]}>
                <Input placeholder="" allowClear={true} maxLength="50" disabled={loading} />
              </StyledFormItem>
              <StyledFormItem label="Mailing Address 邮寄地址" name="address" rules={[{ required: false, max: 200, message: ' ' }]}>
                <Input placeholder="" allowClear={true} maxLength="200" disabled={loading} />
              </StyledFormItem>
              <StyledFormItem label="Occupation 职业" name="occupation" rules={[{ required: false, max: 100, message: ' ' }]}>
                <Input placeholder="" allowClear={true} maxLength="100" disabled={loading} />
              </StyledFormItem>
              <StyledFormItem label="Hobbies 兴趣" name="hobby" rules={[{ required: false, max: 500, message: ' ' }]}>
                <Input placeholder="" allowClear={true} maxLength="500" disabled={loading} />
              </StyledFormItem>
            </>}
            {isBusiness && <StyledFormItem label="Remark" name="remark" rules={[{ required: false, max: 1000, message: ' ' }]}>
              <Input.TextArea autoSize placeholder="" allowClear={true} maxLength="1000" disabled={loading} />
            </StyledFormItem>}
            {/* <Divider>Security</Divider> */}
            {isSignUp && <>
              <StyledFormItem label="Password (at least 8 letters)" name="password" rules={[{ required: isSignUp, min: 8, message: ' ' }]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
              </StyledFormItem>
              <StyledFormItem label="Confirm Password" name="confirmPassword" rules={[{ required: isSignUp, min: 8, message: ' ' }, this.validateConfirmPasswordRule]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
              </StyledFormItem>
            </>}
            <StyledFormItem label="Pictures" name="pictures" rules={[{ required: false, message: ' ' }]}>
              <ProfilePictureUploader disabled={loading}></ProfilePictureUploader>
            </StyledFormItem>
            {isSignUp && <StyledFormItem label="Agreement" name="agreement" valuePropName="checked" rules={[{
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
            }]}>
              <Checkbox disabled={loading}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
            </StyledFormItem>}
            <StyledFormItem style={{ paddingTop: '2rem' }}>
              <Button block type="primary" htmlType="submit" disabled={loading}>{this.props.okButtonText || 'Submit'}</Button>
              {!isAdmin && <Button block size="large" type="link" onClick={() => this.goBack()}>Cancel</Button>}
            </StyledFormItem>
          </Form>);
        }
      }</GlobalContext.Consumer>
    );
  }
}

ProfileForm.propTypes = {};

ProfileForm.defaultProps = {};

export default withRouter(ProfileForm);
