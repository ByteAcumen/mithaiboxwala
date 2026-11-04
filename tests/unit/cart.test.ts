import { describe, it, expect } from 'vitest';
import { calculateEffectivePrice } from '@/server/services/cart.service';
import { isValidOrderStatusTransition } from '@/server/services/order.service';

describe('Cart Pricing & Bulk Tiers Service', () => {
  const tiers = [
    { minQty: 100, maxQty: 499, pricePerUnit: 74 },
    { minQty: 500, maxQty: 999, pricePerUnit: 68 },
    { minQty: 1000, pricePerUnit: 62 },
  ];

  it('returns base price when quantity is below the first tier', () => {
    const price = calculateEffectivePrice(85, 50, tiers);
    expect(price).toBe(85);
  });

  it('applies the first tier when quantity is between 100 and 499', () => {
    const price = calculateEffectivePrice(85, 150, tiers);
    expect(price).toBe(74);
  });

  it('applies the middle tier when quantity is between 500 and 999', () => {
    const price = calculateEffectivePrice(85, 500, tiers);
    expect(price).toBe(68);
  });

  it('applies the highest tier for quantities >= 1000', () => {
    const price = calculateEffectivePrice(85, 2500, tiers);
    expect(price).toBe(62);
  });

  it('safely handles empty bulk tiers array', () => {
    const price = calculateEffectivePrice(85, 500, []);
    expect(price).toBe(85);
  });
});

describe('Order State Machine Transition Enforcement', () => {
  it('allows valid forward transitions', () => {
    expect(isValidOrderStatusTransition('pending_payment', 'confirmed')).toBe(true);
    expect(isValidOrderStatusTransition('confirmed', 'processing')).toBe(true);
    expect(isValidOrderStatusTransition('processing', 'packed')).toBe(true);
    expect(isValidOrderStatusTransition('packed', 'shipped')).toBe(true);
    expect(isValidOrderStatusTransition('shipped', 'delivered')).toBe(true);
  });

  it('rejects illegal status jumps or regressions', () => {
    expect(isValidOrderStatusTransition('pending_payment', 'delivered')).toBe(false);
    expect(isValidOrderStatusTransition('shipped', 'confirmed')).toBe(false);
    expect(isValidOrderStatusTransition('delivered', 'pending_payment')).toBe(false);
    expect(isValidOrderStatusTransition('cancelled', 'delivered')).toBe(false);
  });
});
