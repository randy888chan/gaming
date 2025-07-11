// Utility function tests
function sum(a: number, b: number): number {
  return a + b;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

describe("Utility Functions", () => {
  test("sum adds two numbers correctly", () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 5)).toBe(4);
    expect(sum(0, 0)).toBe(0);
  });

  test("formatCurrency formats numbers correctly", () => {
    expect(formatCurrency(10)).toBe("$10.00");
    expect(formatCurrency(5.5)).toBe("$5.50");
    expect(formatCurrency(1000)).toBe("$1000.00");
  });
});
