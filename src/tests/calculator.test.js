const { calculate, normalizeOperation, parseNumber, run } = require('../calculator');

describe('normalizeOperation', () => {
  test.each([
    ['add', 'add'],
    ['+', 'add'],
    ['subtract', 'subtract'],
    ['-', 'subtract'],
    ['multiply', 'multiply'],
    ['*', 'multiply'],
    ['x', 'multiply'],
    ['X', 'multiply'],
    ['divide', 'divide'],
    ['/', 'divide'],
  ])('maps %s to %s', (input, expected) => {
    expect(normalizeOperation(input)).toBe(expected);
  });

  test('throws for unsupported operations', () => {
    expect(() => normalizeOperation('mod')).toThrow(
      'Invalid operation "mod". Supported operations: add (+), subtract (-), multiply (*), divide (/).',
    );
  });
});

describe('parseNumber', () => {
  test.each([
    ['2', 2],
    ['-4', -4],
    ['3.5', 3.5],
    ['0', 0],
  ])('parses %s as %d', (input, expected) => {
    expect(parseNumber(input, 'test number')).toBe(expected);
  });

  test('throws for invalid numeric input', () => {
    expect(() => parseNumber('hello', 'first number')).toThrow(
      'Invalid first number "hello". Please provide a valid number.',
    );
  });
});

describe('calculate', () => {
  test.each([
    ['+', '2', '3', { operation: 'add', symbol: '+', result: 5 }],
    ['-', '10', '4', { operation: 'subtract', symbol: '-', result: 6 }],
    ['*', '45', '2', { operation: 'multiply', symbol: '*', result: 90 }],
    ['/', '20', '5', { operation: 'divide', symbol: '/', result: 4 }],
  ])('computes %s with image-based examples', (operation, left, right, expected) => {
    expect(calculate(operation, left, right)).toMatchObject({
      left: Number(left),
      right: Number(right),
      ...expected,
    });
  });

  test('supports decimals', () => {
    expect(calculate('add', '2.5', '1.25').result).toBe(3.75);
  });

  test('supports negative numbers', () => {
    expect(calculate('subtract', '-3', '7').result).toBe(-10);
  });

  test('throws on division by zero', () => {
    expect(() => calculate('divide', '20', '0')).toThrow('Division by zero is not allowed.');
  });

  test('throws on invalid operations', () => {
    expect(() => calculate('%', '10', '2')).toThrow('Invalid operation "%"');
  });

  test('throws when either operand is invalid', () => {
    expect(() => calculate('add', 'ten', '2')).toThrow(
      'Invalid first number "ten". Please provide a valid number.',
    );
  });
});

describe('run', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    process.exitCode = undefined;
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    process.exitCode = undefined;
  });

  test('prints the calculation result for valid CLI arguments', async () => {
    await run(['+', '2', '3']);

    expect(console.log).toHaveBeenCalledWith('2 + 3 = 5');
    expect(process.exitCode).toBeUndefined();
  });

  test('prints usage and sets exit code for invalid argument count', async () => {
    await run(['add', '2']);

    expect(console.error).toHaveBeenCalledWith(
      'Usage: node src/calculator.js <operation> <first-number> <second-number>\n' +
        'Supported operations: add (+), subtract (-), multiply (*), divide (/)\n' +
        'Run without arguments to use interactive mode.',
    );
    expect(process.exitCode).toBe(1);
  });

  test('rejects invalid calculations', async () => {
    await expect(run(['/', '20', '0'])).rejects.toThrow('Division by zero is not allowed.');
  });
});
