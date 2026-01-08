jest.mock('@aws-sdk/client-lambda', () => ({
  InvokeCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('@aws/lambda_client', () => ({
  LambdaClientWrapper: jest.fn(),
}))

import { LambdaAdapter } from './lambda'

describe('LambdaAdapter', () => {
  let lambdaClient: any
  let adapter: LambdaAdapter

  beforeEach(() => {
    lambdaClient = { send: jest.fn().mockResolvedValue({}) }
    adapter = new LambdaAdapter(lambdaClient)
    jest.clearAllMocks()
  })

  it('should invoke Lambda with correct parameters', async () => {
    const functionName = 'myLambda'
    const payload = { foo: 'bar' }

    await adapter.invokeEvent(functionName, payload)

    expect(lambdaClient.send).toHaveBeenCalledTimes(1)
    const calledCommand = lambdaClient.send.mock.calls[0][0]
    expect(calledCommand.FunctionName).toBe(functionName)
    expect(calledCommand.InvocationType).toBe('Event')
    expect(JSON.parse(Buffer.from(calledCommand.Payload).toString()).body).toEqual(payload)
  })

  it('should invoke Lambda and return parsed response', async () => {
    const functionName = 'myLambda'
    const pathParams = { id: '123' }
    const lambdaResponsePayload = { result: 'success' }

    lambdaClient.send.mockResolvedValue({
      Payload: Buffer.from(JSON.stringify(lambdaResponsePayload)),
    })

    const result = await adapter.invoke<any>(functionName, pathParams)

    expect(lambdaClient.send).toHaveBeenCalledTimes(1)
    const calledCommand = lambdaClient.send.mock.calls[0][0]
    expect(calledCommand.FunctionName).toBe(functionName)
    expect(calledCommand.InvocationType).toBe('RequestResponse')
    expect(JSON.parse(Buffer.from(calledCommand.Payload).toString()).pathParameters).toEqual(pathParams)
    expect(result).toEqual(lambdaResponsePayload)
  })

  it('should return null if Lambda response has no payload', async () => {
    const functionName = 'myLambda'
    const pathParams = { id: '123' }

    lambdaClient.send.mockResolvedValue({})

    const result = await adapter.invoke<any>(functionName, pathParams)
    expect(result).toBeNull()
  })
})
