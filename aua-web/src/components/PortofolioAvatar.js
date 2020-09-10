import React from 'react';
import PropTypes from 'prop-types';
import toMaterialStyle from 'material-color-hash';
import { Typography, Avatar } from 'antd';

const { Text } = Typography;

function getLabel(name) {
  const initials = name.split(/ +/g).map(w => w.charAt(0).toUpperCase());
  return initials.length === 1 ? initials[0] : initials[0] + initials[1];
}

export const PortofolioAvatar = props => {
  const { value, size, style, ...other } = props;
  if(!value) return null;
  const {backgroundColor, color} = toMaterialStyle(value, 800);
  const name = getLabel(value);
  const fontSize = 28 * size / 64;
  return <div><Avatar
    size={size}
    {...other}
    style={{...style, backgroundColor}}
  >
    <Text style={{fontSize, color}}>{name}</Text>
  </Avatar></div>
}

PortofolioAvatar.propTypes = {
  value: PropTypes.string.isRequired,
};

PortofolioAvatar.defaultProps = {
  size: 64
};
