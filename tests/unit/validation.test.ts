import { describe, it, expect } from 'vitest';
import { PincodeSchema, PhoneSchema, EmailSchema, AddressSchema } from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('Indian Pincode Schema', () => {
    it('accepts valid 6-digit Indian PIN codes', () => {
      expect(PincodeSchema.safeParse('231001').success).toBe(true);
      expect(PincodeSchema.safeParse('110001').success).toBe(true);
      expect(PincodeSchema.safeParse('400060').success).toBe(true);
    });

    it('rejects invalid PIN codes', () => {
      expect(PincodeSchema.safeParse('12345').success).toBe(false);
      expect(PincodeSchema.safeParse('1234567').success).toBe(false);
      expect(PincodeSchema.safeParse('ABCDEF').success).toBe(false);
    });
  });

  describe('Indian Mobile Phone Schema', () => {
    it('accepts valid 10-digit mobile numbers starting with 6-9', () => {
      expect(PhoneSchema.safeParse('9876543210').success).toBe(true);
      expect(PhoneSchema.safeParse('8123456789').success).toBe(true);
      expect(PhoneSchema.safeParse('7012345678').success).toBe(true);
    });

    it('rejects numbers not starting with 6-9 or invalid lengths', () => {
      expect(PhoneSchema.safeParse('1234567890').success).toBe(false);
      expect(PhoneSchema.safeParse('98765').success).toBe(false);
    });
  });

  describe('Address Schema', () => {
    it('validates a complete address object', () => {
      const validAddress = {
        fullName: 'Ajay Kumar',
        phone: '9876543210',
        addressLine1: 'Main Market, Mirzapur',
        city: 'Mirzapur',
        state: 'Uttar Pradesh',
        pincode: '231001',
        country: 'India',
      };
      expect(AddressSchema.safeParse(validAddress).success).toBe(true);
    });
  });
});
