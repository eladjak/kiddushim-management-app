import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RTLLayout, RTLButton, RTLFlex } from "../ui/rtl-layout";

describe("RTLLayout", () => {
  it("renders children correctly", () => {
    render(<RTLLayout>Test content</RTLLayout>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("sets dir=rtl by default", () => {
    render(<RTLLayout>RTL content</RTLLayout>);
    const wrapper = screen.getByText("RTL content");
    expect(wrapper.getAttribute("dir")).toBe("rtl");
  });

  it("sets dir=ltr when enableRTL is false", () => {
    render(<RTLLayout enableRTL={false}>LTR content</RTLLayout>);
    const wrapper = screen.getByText("LTR content");
    expect(wrapper.getAttribute("dir")).toBe("ltr");
  });

  it("applies custom className", () => {
    render(<RTLLayout className="custom-class">Styled</RTLLayout>);
    const wrapper = screen.getByText("Styled");
    expect(wrapper.className).toContain("custom-class");
  });
});

describe("RTLButton", () => {
  it("renders button with children", () => {
    render(<RTLButton>Click me</RTLButton>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<RTLButton className="my-btn">Styled button</RTLButton>);
    const button = screen.getByRole("button", { name: "Styled button" });
    expect(button.className).toContain("my-btn");
  });

  it("passes through HTML button attributes", () => {
    render(
      <RTLButton disabled type="submit">
        Submit
      </RTLButton>
    );
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
    expect(button.getAttribute("type")).toBe("submit");
  });
});

describe("RTLFlex", () => {
  it("renders children in a flex container", () => {
    render(
      <RTLFlex>
        <span>Item 1</span>
        <span>Item 2</span>
      </RTLFlex>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("has flex-row-reverse class by default", () => {
    render(<RTLFlex data-testid="flex-container">Content</RTLFlex>);
    const container = screen.getByTestId("flex-container");
    expect(container.className).toContain("flex");
    expect(container.className).toContain("flex-row-reverse");
  });

  it("merges custom className", () => {
    render(
      <RTLFlex className="gap-4" data-testid="flex-container">
        Content
      </RTLFlex>
    );
    const container = screen.getByTestId("flex-container");
    expect(container.className).toContain("gap-4");
    expect(container.className).toContain("flex");
  });
});
