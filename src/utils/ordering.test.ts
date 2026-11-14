import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  formatNaira,
  validatePhoneNumber,
  validateEmail,
  generateOrderNumber,
  isValidStatusTransition,
} from './ordering';

test('calculateOrderTotals correctly computes subtotal and applies delivery fee', () => {
  const items = [
    { price: 4500, quantity: 2 }, // 9000
    { price: 2000, quantity: 1 }, // 2000
  ];

  const deliveryResult = calculateOrderTotals(items, 'delivery', 1500, 25000);
  assert.equal(deliveryResult.subtotal, 11000);
  assert.equal(deliveryResult.deliveryFee, 1500);
  assert.equal(deliveryResult.isFreeDelivery, false);
  assert.equal(deliveryResult.totalAmount, 12500);
  assert.equal(deliveryResult.itemCount, 3);

  // Pickup has 0 delivery fee
  const pickupResult = calculateOrderTotals(items, 'pickup', 1500, 25000);
  assert.equal(pickupResult.deliveryFee, 0);
  assert.equal(pickupResult.totalAmount, 11000);
});

test('calculateOrderTotals applies free delivery over threshold', () => {
  const highValueItems = [
    { price: 15000, quantity: 2 }, // 30000
  ];

  const result = calculateOrderTotals(highValueItems, 'delivery', 1500, 25000);
  assert.equal(result.subtotal, 30000);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.isFreeDelivery, true);
  assert.equal(result.totalAmount, 30000);
});

test('formatNaira formats numbers into proper Nigerian Naira representation', () => {
  assert.equal(formatNaira(0), '₦0');
  assert.equal(formatNaira(4500), '₦4,500');
  assert.equal(formatNaira(125000), '₦125,000');
});

test('validatePhoneNumber accepts valid Nigerian phone numbers and rejects bad ones', () => {
  const validLocal = validatePhoneNumber('08031234567');
  assert.equal(validLocal.isValid, true);
  assert.equal(validLocal.normalized, '08031234567');

  const validIntl = validatePhoneNumber('+2348031234567');
  assert.equal(validIntl.isValid, true);
  assert.equal(validIntl.normalized, '08031234567');

  const withSpaces = validatePhoneNumber('0812 345 6789');
  assert.equal(withSpaces.isValid, true);

  const invalidShort = validatePhoneNumber('080123');
  assert.equal(invalidShort.isValid, false);

  const invalidLetters = validatePhoneNumber('080abcdefgh');
  assert.equal(invalidLetters.isValid, false);
});

test('validateEmail validates valid and invalid emails', () => {
  assert.equal(validateEmail('customer@gmail.com'), true);
  assert.equal(validateEmail('test.user@domain.ng'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
});

test('generateOrderNumber generates standard TFK-XXXX-XX pattern', () => {
  const orderNum = generateOrderNumber();
  assert.match(orderNum, /^TFK-\d{4}-[A-Z0-9]{2}$/);
});

test('isValidStatusTransition validates sequential restaurant flow', () => {
  assert.equal(isValidStatusTransition('Pending', 'Confirmed'), true);
  assert.equal(isValidStatusTransition('Confirmed', 'Preparing'), true);
  assert.equal(isValidStatusTransition('Preparing', 'Out for Delivery'), true);
  assert.equal(isValidStatusTransition('Out for Delivery', 'Delivered'), true);
  assert.equal(isValidStatusTransition('Pending', 'Cancelled'), true);

  // Invalid skip transitions
  assert.equal(isValidStatusTransition('Pending', 'Delivered'), false);
  assert.equal(isValidStatusTransition('Delivered', 'Pending'), false);
});
