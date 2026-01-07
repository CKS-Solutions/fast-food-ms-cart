import { Cart } from '@entities/cart'
import { CartStatus } from '@entities/cart.types'

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
  GetCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}))

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

import { CartRepository } from './cart_repository'
import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

describe('CartRepository', () => {
  let client: any
  let repo: CartRepository

  beforeEach(() => {
    client = {
      send: jest.fn().mockImplementation((params) => ({ params })),
    }
    repo = new CartRepository(client)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create', () => {
    it('should send PutCommand', async () => {
      const cart = {} as Cart
      client.send.mockResolvedValue({})

      await repo.create(cart)
      expect(client.send).toHaveBeenCalledWith(expect.any(PutCommand))
    })
  })

  describe('findById', () => {
    it('should return cart when found', async () => {
      const cartId = 'cart-123'
      const mockCart = {
        id: 'cart-123',
        status: CartStatus.Open,
        products: [],
        customer_id: 'customer-123',
        created_at: 1620000000000,
        updated_at: 1620000000000,
        expires_at: 1620003600000,
      } as Omit<Cart, 'addProducts' | 'removeProducts' | 'checkout'>

      client.send.mockResolvedValue({ Item: mockCart })

      const result = await repo.findById(cartId)
      expect(result).toEqual(mockCart)
      expect(client.send).toHaveBeenCalledWith(expect.any(GetCommand))
    })

    it('should return null when cart not found', async () => {
      const cartId = 'cart-123'
      client.send.mockResolvedValue({})

      const result = await repo.findById(cartId)
      expect(result).toBeNull()
    })
  })

  describe('findByCustomerId', () => {
    it('should return cart when found', async () => {
      const customerId = 'customer-123'
      const mockCart = {
        id: 'cart-123',
        status: CartStatus.Open,
        products: [],
        created_at: 1620000000000,
        updated_at: 1620000000000,
        expires_at: 1620003600000,
      } as Omit<Cart, 'addProducts' | 'removeProducts' | 'checkout'>

      client.send.mockResolvedValue({ Items: [mockCart] })

      const result = await repo.findByCustomerId(customerId)
      expect(result).toEqual(mockCart)
      expect(client.send).toHaveBeenCalledWith(expect.any(QueryCommand))
    })

    it('should return null when no open cart found', async () => {
      const customerId = 'customer-123'
      const mockCart = {
        id: 'cart-123',
        status: CartStatus.Closed,
        products: [],
        created_at: 1620000000000,
        updated_at: 1620000000000,
        expires_at: 1620003600000,
      } as Omit<Cart, 'addProducts' | 'removeProducts' | 'checkout'>

      client.send.mockResolvedValue({ Items: [mockCart] })

      const result = await repo.findByCustomerId(customerId)
      expect(result).toBeNull()
    })

    it('should return null when no cart found', async () => {
      const customerId = 'customer-123'
      client.send.mockResolvedValue({ Items: [] })

      const result = await repo.findByCustomerId(customerId)
      expect(result).toBeNull()
    })
  })

  describe('findAllExpired', () => {
    it('should return list of expired carts', async () => {
      const now = Date.now()
      const mockCarts = [
        {
          id: 'cart-123',
          status: CartStatus.Open,
          products: [],
          created_at: 1620000000000,
          updated_at: 1620000000000,
          expires_at: now - 1000,
        },
        {
          id: 'cart-456',
          status: CartStatus.Open,
          products: [],
          created_at: 1620000000000,
          updated_at: 1620000000000,
          expires_at: now - 5000,
        },
      ] as Omit<Cart, 'addProducts' | 'removeProducts' | 'checkout'>[]

      client.send.mockResolvedValue({ Items: mockCarts })

      const result = await repo.findAllExpired(now)

      expect(result).toEqual(mockCarts)
      expect(client.send).toHaveBeenCalledWith(expect.any(QueryCommand))
    })

    it('should return empty list when no expired carts found', async () => {
      const now = Date.now()
      client.send.mockResolvedValue({ Items: [] })

      const result = await repo.findAllExpired(now)
      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    it('should send PutCommand', async () => {
      const cart = {} as Cart
      client.send.mockResolvedValue({})
      await repo.update(cart)
      expect(client.send).toHaveBeenCalledWith(expect.any(PutCommand))
    })
  })

  describe('remove', () => {
    it('should send DeleteCommand', async () => {
      const cart = Cart.create()
      client.send.mockResolvedValue({})
      await repo.remove(cart.id)
      expect(client.send).toHaveBeenCalledWith(expect.any(DeleteCommand))
    })
  })
})
