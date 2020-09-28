import { Button, Form, Input, Radio, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { varNameToLabelName } from 'util/varNameToLabelName';

const { Text } = Typography;

const FieldsEditor = (props) => {
  const { job, onChange, disabled } = props;

  const handleSubmit = async (values) => {
    onChange({
      ...job,
      ...values,
    });
  }

  if (!job) {
    return null;
  }

  return <Form
    layout="vertical"
    onFinish={handleSubmit}
    style={{ textAlign: 'left' }}
    initialValues={job}
  >
    <Form.Item label="Job Name" name="name" rules={[{ required: true }]}>
      <Input disabled={disabled} />
    </Form.Item>

    {job.fields.filter(field => !field.officialOnly).map((field, i) => {
      const { name, description, type, required } = field;
      const formItemProps = {
        label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
        name: ['fields', i, 'value'],
        rules: [{ required }]
      }
      return (
        <Form.Item key={i} {...formItemProps}>
          {type === 'text' ? <Input disabled={disabled} /> :
            type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={disabled} /> :
              type === 'monthRange' ? <RangePickerInput picker="month" disabled={disabled} /> :
                type === 'number' ? <Input disabled={disabled} type="number" pattern="[0-9.]*" /> :
                  type === 'paragraph' ? <Input.TextArea disabled={disabled} /> :
                    type === 'date' ? <DateInput picker="date" disabled={disabled} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                      type === 'select' ? <Radio.Group disabled={disabled} buttonStyle="solid">
                        {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                      </Radio.Group> :
                        <Text danger>Unsupported field type '{type}'</Text>}
        </Form.Item>
      );
    })}
    <Form.Item>
      <Button key="submit" block type="primary" htmlType="submit" disabled={disabled}>Next</Button>
    </Form.Item>
  </Form>
};

FieldsEditor.propTypes = {
  job: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

FieldsEditor.defaultProps = {
  disabled: false
};

export default withRouter(FieldsEditor);
