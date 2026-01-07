import { CheckoutCartContainerFactory } from '@di/checkout_cart'
import { handler } from './checkout_cart'
import { HTTPNotFound, HTTPStatus } from '@utils/http'

jest.mock('@di/checkout_cart', () => ({
  CheckoutCartContainerFactory: jest.fn(),
}))

describe('CheckoutCart Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(CheckoutCartContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 when path parameter cart_id is missing', async () => {
    const event = { pathParameters: {} } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'cartId path parameter is required' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const event = { pathParameters: { cart_id: 'cart-123' } } as any

    const response = await handler(event)

    expect(mockExecute).toHaveBeenCalledWith('cart-123')
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Cart checked out successfully' } })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const event = { pathParameters: { cart_id: 'cart-123' } } as any

    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    const event = { pathParameters: { cart_id: 'cart-123' } } as any
    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
