import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Typography from '../typography/typography';
import { COLORS, TYPOGRAPHY } from '../../../helpers/constants/design-system';
import { DECIMAL_REGEX } from '../../../../shared/constants/tokens';

export default function NumericInput({
  detailText = '',
  suffix = '',
  value,
  onChange,
  error = '',
  autoFocus = false,
  allowDecimals = true,
  disabled = false,
  dataTestId,
  placeholder,
  id,
  name,
}) {
  const getInputWidth = function () {
    if (!value) {
      return '100%';
    }
    const valueString = String(value);
    const valueLength = valueString.length || 1;
    const decimalPointDeficit = valueString.match(/,/u) ? -0.5 : 0;
    const oneSizeDeficit = valueString.match(/1/gu)?.length * -0.5 || 0;
    return `${3 + valueLength + decimalPointDeficit + oneSizeDeficit}ch`;
  };

  return (
    <div
      className={classNames('numeric-input', { 'numeric-input--error': error })}
    >
      <input
        type="number"
        value={value}
        onKeyDown={(e) => {
          if (!allowDecimals && e.key === '.') {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const newValue = e.target.value;
          const match = DECIMAL_REGEX.exec(newValue);
          if (match?.[1]?.length >= 15) {
            return;
          }
          onChange?.(parseFloat(newValue || 0, 10));
        }}
        min="0"
        autoFocus={autoFocus}
        disabled={disabled}
        data-testid={dataTestId}
        placeholder={placeholder}
        id={id}
        name={name}
        style={{ width: getInputWidth() }}
      />
      {suffix && value && <div className="numeric-input__suffix">{suffix}</div>}
      {detailText && (
        <Typography
          color={COLORS.TEXT_ALTERNATIVE}
          variant={TYPOGRAPHY.H7}
          as="span"
        >
          {detailText}
        </Typography>
      )}
    </div>
  );
}

NumericInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  detailText: PropTypes.string,
  suffix: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  autoFocus: PropTypes.bool,
  allowDecimals: PropTypes.bool,
  disabled: PropTypes.bool,
  dataTestId: PropTypes.string,
  placeholder: PropTypes.string,
  /**
   * The name of the input
   */
  name: PropTypes.string,
  /**
   * The id of the input element. Should be used with htmlFor with a label element.
   */
  id: PropTypes.string,
};
