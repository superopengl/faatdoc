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
    const { mode, initialValues, loading } = this.props;
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
          const isClient = role === 'client';

          return (<Form layout="vertical" onFinish={this.handleSubmit} style={{ textAlign: 'left' }} initialValues={formInitValues}>
            <StyledFormItem label="Email" name="email" rules={[{ required: isSignUp, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={isEmailDisable} autoFocus={true} />
            </StyledFormItem>
            <StyledFormItem label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="" allowClear={true} autoComplete="given-name" maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="" allowClear={true} autoComplete="family-name" maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Company" name="company" rules={[{ required: false, whitespace: true, max: 100, message: ' ' }]}>
              <Input placeholder="" allowClear={true} autoComplete="organization" maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Gender" name="gender" rules={[{ required: true, message: 'Please choose a gender' }]}>
              <Radio.Group buttonStyle="solid">
                <Radio style={{ display: 'block', height: '2rem' }} value="male">Male</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="female">Female</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="secret">Prefer not to say</Radio>
                <Radio style={{ display: 'block', height: '2rem' }} value="other">Other</Radio>
              </Radio.Group>
            </StyledFormItem>
            <StyledFormItem label="Date of Birth" name="dob" rules={[{ required: false, validator: this.validateDob, message: 'Invalid date or not a past date' }]}>
              <DatePicker placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" onChange={() => { }} />
            </StyledFormItem>
            <StyledFormItem label="Phone (split with ',' if there are more than one)" name="phone" rules={[{ required: true, max: 100, message: ' ' }]}>
              <Input placeholder="Phone" type="tel" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="WeChat ID" name="wechat" rules={[{ required: false, max: 50, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="50" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Address" name="address" rules={[{ required: true, max: 100, message: ' ' }]}>
              <Input placeholder="Address" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="TFN" name="tfn" rules={[{ required: false, max: 20, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="20" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="ABN" name="abn" rules={[{ required: false, max: 20, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="20" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="ACN" name="acn" rules={[{ required: false, max: 20, message: ' ' }]}>
              <Input placeholder="" allowClear={true} maxLength="20" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Occupation" name="occupation" rules={[{ required: false, max: 100, message: ' ' }]}>
              <Input placeholder="Occupation" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Business Industry" name="industry" rules={[{ required: false, max: 100, message: ' ' }]}>
              <Input placeholder="Business Industry" allowClear={true} maxLength="100" disabled={loading} />
            </StyledFormItem>
            <StyledFormItem label="Remark" name="remark" rules={[{ required: false, max: 1000, message: ' ' }]}>
              <Input.TextArea autoSize placeholder="" allowClear={true} maxLength="1000" disabled={loading} />
            </StyledFormItem>
            {/* <Divider>Security</Divider> */}
            {isSignUp && <>
              <StyledFormItem label="Password (at least 8 letters)" name="password" rules={[{ required: isSignUp, min: 8, message: ' ' }]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
              </StyledFormItem>
              <StyledFormItem label="Confirm Password" name="confirmPassword" rules={[{ required: isSignUp, min: 8, message: ' ' }, this.validateConfirmPasswordRule]}>
                <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
              </StyledFormItem>
            </>}
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
