import { Cart } from './cart'
import { CartStatus } from './cart.types'

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}))

describe('Cart', () => {
  const NOW = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should set properties correctly', () => {
      const cart = new Cart({
        id: 'cart-123',
        status: CartStatus.Open,
        customerId: 'customer-123',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
      })

      expect(cart.id).toBe('cart-123')
      expect(cart.status).toBe(CartStatus.Open)
      expect(cart.customer_id).toBe('customer-123')
      expect(cart.products).toEqual([])
      expect(cart.created_at).toBe(1620000000000)
      expect(cart.updated_at).toBe(1620000000000)
    })

    it('should handle products array', () => {
      const cart = new Cart({
        id: 'cart-123',
        status: CartStatus.Open,
        products: [{ productId: 'prod-1', quantity: 2, price: 50 }],
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
      })

      expect(cart.products).toEqual([{ productId: 'prod-1', quantity: 2, price: 50 }])
    })
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const payment = Cart.create()

      expect(payment).toBeInstanceOf(Cart)

      expect(payment.id).toBe('uuid-123')
      expect(payment.status).toBe(CartStatus.Open)
      expect(payment.products).toEqual([])
    })

    it('should set created_at and updated_at to now', () => {
      const payment = Cart.create()

      expect(payment.created_at).toBe(NOW)
      expect(payment.updated_at).toBe(NOW)
    })
  })
})
