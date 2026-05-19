#!/usr/bin/env node

/**
 * CLI calculator supporting the four basic operations:
 * - addition
 * - subtraction
 * - multiplication
 * - division
 */

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const OPERATIONS = {
  add: {
    symbol: '+',
    perform: (left, right) => left + right,
  },
  subtract: {
    symbol: '-',
    perform: (left, right) => left - right,
  },
  multiply: {
    symbol: '*',
    perform: (left, right) => left * right,
  },
  divide: {
    symbol: '/',
    perform: (left, right) => {
      if (right === 0) {
        throw new Error('Division by zero is not allowed.');
      }

      return left / right;
    },
  },
};

const OPERATION_ALIASES = {
  add: 'add',
  '+': 'add',
  subtract: 'subtract',
  '-': 'subtract',
  multiply: 'multiply',
  '*': 'multiply',
  x: 'multiply',
  X: 'multiply',
  '×': 'multiply',
  divide: 'divide',
  '/': 'divide',
  '÷': 'divide',
};

function normalizeOperation(input) {
  const normalizedOperation = OPERATION_ALIASES[input];

  if (!normalizedOperation) {
    throw new Error(
      `Invalid operation "${input}". Supported operations: add (+), subtract (-), multiply (*), divide (/).`,
    );
  }

  return normalizedOperation;
}

function parseNumber(value, label) {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid ${label} "${value}". Please provide a valid number.`);
  }

  return parsedValue;
}

function calculate(operationInput, leftInput, rightInput) {
  const operation = normalizeOperation(operationInput);
  const left = parseNumber(leftInput, 'first number');
  const right = parseNumber(rightInput, 'second number');
  const result = OPERATIONS[operation].perform(left, right);

  return {
    operation,
    left,
    right,
    result,
    symbol: OPERATIONS[operation].symbol,
  };
}

function printUsage() {
  console.error(
    'Usage: node src/calculator.js <operation> <first-number> <second-number>\n' +
      'Supported operations: add (+), subtract (-), multiply (*), divide (/)\n' +
      'Run without arguments to use interactive mode.',
  );
}

async function promptForInputs() {
  const cli = readline.createInterface({ input: stdin, output: stdout });

  try {
    const operation = await cli.question(
      'Choose an operation (add, subtract, multiply, divide, +, -, *, /): ',
    );
    const firstNumber = await cli.question('Enter the first number: ');
    const secondNumber = await cli.question('Enter the second number: ');

    return {
      operation,
      firstNumber,
      secondNumber,
    };
  } finally {
    cli.close();
  }
}

async function run(argv = process.argv.slice(2)) {
  let operation;
  let firstNumber;
  let secondNumber;

  if (argv.length === 0) {
    ({ operation, firstNumber, secondNumber } = await promptForInputs());
  } else if (argv.length === 3) {
    [operation, firstNumber, secondNumber] = argv;
  } else {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const calculation = calculate(operation, firstNumber, secondNumber);
  console.log(`${calculation.left} ${calculation.symbol} ${calculation.right} = ${calculation.result}`);
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  calculate,
  normalizeOperation,
  parseNumber,
  run,
};
