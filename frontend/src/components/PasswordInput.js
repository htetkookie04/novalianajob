import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  name,
  required,
  disabled,
  autoComplete,
  id,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="password-input">
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          {...rest}
        />
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          disabled={disabled}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;


