import { useState, useCallback, useRef } from 'react';

/**
 * useForm — lightweight form state manager
 *
 * @param {object} initialValues
 * @param {function} validate  — (values) => errors object
 */
export function useForm(initialValues = {}, validate) {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Keep a stable ref to initialValues so reset() always uses the latest snapshot
  const initialRef = useRef(initialValues);
  initialRef.current = initialValues;

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        return { ...prev, [name]: undefined };
      }
      return prev;
    });
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      const errs = validate(values);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  }, [validate, values]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialRef.current);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault();
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (validate) {
      const errs = validate(values);
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }, [values, validate]);

  const isValid = validate
    ? Object.values(validate(values)).every(e => !e)
    : true;

  return {
    values,
    errors,
    touched,
    submitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setErrors,
    reset,
  };
}
