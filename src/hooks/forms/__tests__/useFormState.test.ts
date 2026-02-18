import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormState } from "../useFormState";

interface TestFormData {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  tags: string[];
  [key: string]: unknown;
}

const defaultState: TestFormData = {
  name: "",
  email: "",
  age: 0,
  isActive: false,
  tags: [],
};

describe("useFormState", () => {
  it("initializes with provided state", () => {
    const { result } = renderHook(() => useFormState(defaultState));
    expect(result.current.formData).toEqual(defaultState);
  });

  it("handles input change for text fields", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleInputChange({
        target: { name: "name", value: "Test User" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe("Test User");
    // Other fields remain unchanged
    expect(result.current.formData.email).toBe("");
  });

  it("handles select change", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleSelectChange("email", "test@example.com");
    });

    expect(result.current.formData.email).toBe("test@example.com");
  });

  it("handles switch/boolean change", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleSwitchChange("isActive", true);
    });

    expect(result.current.formData.isActive).toBe(true);
  });

  it("handles checkbox add", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleCheckboxChange("tags", "react", true);
    });

    expect(result.current.formData.tags).toEqual(["react"]);
  });

  it("handles checkbox remove", () => {
    const initial = { ...defaultState, tags: ["react", "vue"] };
    const { result } = renderHook(() => useFormState(initial));

    act(() => {
      result.current.handleCheckboxChange("tags", "vue", false);
    });

    expect(result.current.formData.tags).toEqual(["react"]);
  });

  it("handles multiple checkbox additions", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleCheckboxChange("tags", "react", true);
    });
    act(() => {
      result.current.handleCheckboxChange("tags", "typescript", true);
    });

    expect(result.current.formData.tags).toEqual(["react", "typescript"]);
  });

  it("resets form to initial state", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.handleInputChange({
        target: { name: "name", value: "Modified" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe("Modified");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(defaultState);
  });

  it("does not mutate previous state", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    const previousFormData = result.current.formData;

    act(() => {
      result.current.handleInputChange({
        target: { name: "name", value: "New Value" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Previous reference should not be modified
    expect(previousFormData.name).toBe("");
    expect(result.current.formData.name).toBe("New Value");
  });

  it("allows direct setFormData for complex updates", () => {
    const { result } = renderHook(() => useFormState(defaultState));

    act(() => {
      result.current.setFormData({
        ...defaultState,
        name: "Direct",
        age: 25,
        isActive: true,
      });
    });

    expect(result.current.formData.name).toBe("Direct");
    expect(result.current.formData.age).toBe(25);
    expect(result.current.formData.isActive).toBe(true);
  });
});
