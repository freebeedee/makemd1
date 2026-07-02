import jsep from 'jsep';

const ALLOWED_IDENTIFIERS = new Set([
  '$event', '$value', '$state', '$saveState', '$api',
  'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number',
  'Boolean', 'RegExp', 'Error', 'EvalError', 'RangeError', 
  'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'decodeURIComponent',
  'encodeURIComponent', 'decodeURI', 'encodeURI'
]);

const ALLOWED_OPERATORS = new Set([
  '+', '-', '*', '/', '%', '==', '===', '!=', '!==', 
  '<', '>', '<=', '>=', '&&', '||', '!', '?', ':'
]);

const FORBIDDEN_IDENTIFIERS = new Set([
  'eval', 'Function', 'constructor', 'prototype', '__proto__',
  'setTimeout', 'setInterval', 'setImmediate', 'requestAnimationFrame',
  'alert', 'confirm', 'prompt', 'open', 'close', 'fetch', 'XMLHttpRequest',
  'WebSocket', 'Worker', 'SharedWorker', 'importScripts'
]);

export const safeEvaluate = (code: string, context: Record<string, any>): any => {
  if (typeof code !== 'string') return code;
  
  const trimmedCode = code.trim();
  if (!trimmedCode) return undefined;
  
  try {
    const parsed = jsep(trimmedCode);
    return evaluateNode(parsed, context);
  } catch (error) {
    console.error('Safe evaluation failed:', error);
    return undefined;
  }
};

function evaluateNode(node: any, context: Record<string, any>): any {
  if (!node || typeof node !== 'object') {
    return node;
  }

  switch (node.type) {
    case 'Literal':
      return node.value;
    
    case 'Identifier':
      if (FORBIDDEN_IDENTIFIERS.has(node.name)) {
        throw new Error(`Forbidden identifier: ${node.name}`);
      }
      if (!ALLOWED_IDENTIFIERS.has(node.name) && !(node.name in context)) {
        // Allow access to context properties and global Math functions
        if (node.name in Math) {
          return (Math as any)[node.name];
        }
        throw new Error(`Unauthorized identifier: ${node.name}`);
      }
      return context[node.name] ?? (typeof window !== 'undefined' ? (window as any)[node.name] : undefined);
    
    case 'BinaryExpression':
      if (!ALLOWED_OPERATORS.has(node.operator)) {
        throw new Error(`Unauthorized operator: ${node.operator}`);
      }
      const left = evaluateNode(node.left, context);
      const right = evaluateNode(node.right, context);
      return applyOperator(node.operator, left, right);
    
    case 'UnaryExpression':
      if (!ALLOWED_OPERATORS.has(node.operator)) {
        throw new Error(`Unauthorized unary operator: ${node.operator}`);
      }
      const argument = evaluateNode(node.argument, context);
      return applyUnaryOperator(node.operator, argument);
    
    case 'MemberExpression':
      const obj = evaluateNode(node.object, context);
      if (obj === null || obj === undefined) {
        return undefined;
      }
      const prop = node.computed 
        ? evaluateNode(node.property, context)
        : node.property.name;
      
      // Prevent prototype access
      if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') {
        throw new Error('Prototype access is forbidden');
      }
      
      return obj[prop];
    
    case 'CallExpression':
      const callee = evaluateNode(node.callee, context);
      if (typeof callee !== 'function') {
        throw new Error('Invalid function call');
      }
      const args = node.arguments.map((arg: any) => evaluateNode(arg, context));
      return callee(...args);
    
    case 'ConditionalExpression':
      const test = evaluateNode(node.test, context);
      return test 
        ? evaluateNode(node.consequent, context)
        : evaluateNode(node.alternate, context);
    
    case 'LogicalExpression':
      const leftVal = evaluateNode(node.left, context);
      if (node.operator === '&&') {
        return leftVal ? evaluateNode(node.right, context) : leftVal;
      } else if (node.operator === '||') {
        return leftVal ? leftVal : evaluateNode(node.right, context);
      }
      throw new Error(`Unsupported logical operator: ${node.operator}`);
    
    case 'ArrayExpression':
      return node.elements.map((el: any) => evaluateNode(el, context));
    
    case 'ObjectExpression':
      const resultObj: any = {};
      for (const prop of node.properties) {
        const key = prop.key.name || prop.key.value;
        const value = evaluateNode(prop.value, context);
        resultObj[key] = value;
      }
      return resultObj;
    
    default:
      throw new Error(`Unsupported expression type: ${node.type}`);
  }
}

function applyOperator(op: string, left: any, right: any): any {
  switch (op) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '==': return left == right;
    case '===': return left === right;
    case '!=': return left != right;
    case '!==': return left !== right;
    case '<': return left < right;
    case '>': return left > right;
    case '<=': return left <= right;
    case '>=': return left >= right;
    case '&&': return left && right;
    case '||': return left || right;
    default: throw new Error(`Unsupported operator: ${op}`);
  }
}

function applyUnaryOperator(op: string, arg: any): any {
  switch (op) {
    case '-': return -arg;
    case '+': return +arg;
    case '!': return !arg;
    default: throw new Error(`Unsupported unary operator: ${op}`);
  }
}

export function createSafeFunction(codeBlock: string) {
  return function(this: any, ...args: any[]) {
    const context = {
      $event: args[0],
      $value: args[1],
      $state: args[2],
      $saveState: args[3],
      $api: args[4],
      ...this
    };
    return safeEvaluate(codeBlock, context);
  };
}
