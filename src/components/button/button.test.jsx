import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Button from "./index";

describe("Testing compoenent Button", () => {
  it("Testing render Button", () => {
    render(<Button title="Button" />);

    const button = screen.getByText("Button");

    expect(button).toBeInTheDocument();
  });

  it("Testing render with class secundary", () => {
    render(<Button title="Button" kind="secundary" />);

    const button = screen.getByText("Button");

    expect(button).toHaveClass("secundary");
  });

  it("Testing render with class full", () => {
    render(<Button title="Button" kind="full" />);

    const button = screen.getByText("Button");

    expect(button).toHaveClass("full");
  });

  it("Testing Click in Button", () => {
    const mockFunction = jest.fn();

    render(<Button title="Button" onClick={mockFunction} />);

    const button = screen.getByText("Button");

    fireEvent.click(button);

    expect(mockFunction.mock.calls.length).toBe(1);
  });
});
