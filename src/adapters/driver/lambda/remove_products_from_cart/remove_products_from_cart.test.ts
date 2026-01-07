import { RemoveProductsFromCartContainerFactory } from '@di/remove_products_from_cart'
import { handler } from './remove_products_from_cart'
import { HTTPNotFound, HTTPStatus } from '@utils/http'

jest.mock('@di/remove_products_from_cart', () => ({
  RemoveProductsFromCartContainerFactory: jest.fn(),
}))

describe('RemoveProductsFromCart Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(RemoveProductsFromCartContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 when path parameter cart_id is missing', async () => {
    const event = { body: JSON.stringify({ products: [] }), pathParameters: {} } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'cartId path parameter is required' })
  })

  it('should return 400 when body is missing', async () => {
    const event = { body: null, pathParameters: { cart_id: 'cart-123' } } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'products array is required in the request body' })
  })

  it('should return 500 if request body is invalid', async () => {
    const event = { body: "invalid-json", pathParameters: { cart_id: 'cart-123' } } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const event = {
      body: JSON.stringify({
        products: ['prod-1'],
      }),
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const response = await handler(event)

    expect(mockExecute).toHaveBeenCalledWith('cart-123', ['prod-1'])
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Products removed from cart successfully' } })
  })

  it('should call usecase.execute with object body and return 200 on success', async () => {
    const event = {
      body: {
        products: ['prod-1'],
      },
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const response = await handler(event)

    expect(mockExecute).toHaveBeenCalledWith('cart-123', ['prod-1'])
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Products removed from cart successfully' } })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const event = {
      body: JSON.stringify({
        products: ['prod-1'],
      }),
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    const event = {
      body: {
        products: ['prod-1'],
      },
      pathParameters: { cart_id: 'cart-123' },
    } as any

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
