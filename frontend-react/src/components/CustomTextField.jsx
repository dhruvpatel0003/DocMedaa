import React from 'react';
import '../styles/CustomTextField.css';

const CustomTextField = ({
  hint,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error = null,
  required = false,
  multiline = false,
  rows = 3,
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="input-group">
      <InputComponent
        type={type}
        placeholder={hint}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`custom-input ${error ? 'input-error' : ''}`}
        rows={multiline ? rows : undefined}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default CustomTextField;