import { useState, useCallback } from "react";

/**
 * Shared form state management hook for role-specific forms.
 * Handles input, select, switch, and checkbox changes with immutable state updates.
 */
export function useFormState<T extends Record<string, unknown>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback((name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handleCheckboxChange = useCallback(
    (name: string, value: string, checked: boolean) => {
      setFormData((prev) => {
        const current = (prev[name] as string[]) || [];
        const updated = checked
          ? [...current, value]
          : current.filter((item) => item !== value);
        return { ...prev, [name]: updated };
      });
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleCheckboxChange,
    resetForm,
  };
}
