import { OpenCartContainerFactory } from '@di/open_cart'
import { handler } from './open_cart'
import { HTTPNotFound, HTTPStatus } from '@utils/http'
import { APIGatewayProxyEvent } from 'aws-lambda'

jest.mock('@di/open_cart', () => ({
  OpenCartContainerFactory: jest.fn(),
}))

describe('OpenCart Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(OpenCartContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should process correctly even with missing body', async () => {
    const event = { body: null } as APIGatewayProxyEvent
    mockExecute.mockResolvedValue({ id: 'cart-123' })

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { id: 'cart-123' } })
  })

  it('should return 500 if request body is invalid', async () => {
    const event = { body: "invalid-json" } as APIGatewayProxyEvent
    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const event = { body: JSON.stringify({ customerId: 'ext-123' }) } as APIGatewayProxyEvent
    mockExecute.mockResolvedValue({ id: 'cart-123' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith({ customerId: 'ext-123' })
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { id: 'cart-123' } })
  })

  it('should call usecase.execute with object body and return 200 on success', async () => {
    const event = { body: { customerId: 'ext-123' }} as any
    mockExecute.mockResolvedValue({ id: 'cart-123' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith({ customerId: 'ext-123' })
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { id: 'cart-123' } })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const event = { body: JSON.stringify({ customerId: 'ext-123' }) } as APIGatewayProxyEvent
    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    const event = { body: { customerId: 'ext-123' } } as any
    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
