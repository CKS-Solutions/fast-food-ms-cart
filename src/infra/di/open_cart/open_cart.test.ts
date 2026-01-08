import { OpenCartContainerFactory } from './open_cart'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

jest.mock('@aws/lambda_client', () => ({
  LambdaClientWrapper: jest.fn(),
}))

jest.mock('@driven_dynamodb/cart_repository', () => ({
  CartRepository: jest.fn(),
}))

jest.mock('@driven_lambda/lambda', () => ({
  LambdaAdapter: jest.fn(),
}))

jest.mock('@usecases/open_cart', () => ({
  OpenCartUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { CartRepository } from '@driven_dynamodb/cart_repository'
import { OpenCartUseCase } from '@usecases/open_cart'
import { LambdaClientWrapper } from '@aws/lambda_client'
import { LambdaAdapter } from '@driven_lambda/lambda'

describe('OpenCartContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire dependencies and expose usecase', () => {
    const factory = new OpenCartContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledTimes(1)
    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)
    expect(LambdaClientWrapper).toHaveBeenCalledTimes(1)
    expect(LambdaClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoInstance = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]
    const lambdaInstance = (LambdaClientWrapper as jest.Mock).mock.instances[0]

    expect(CartRepository).toHaveBeenCalledTimes(1)
    expect(CartRepository).toHaveBeenCalledWith(dynamoInstance)

    expect(LambdaAdapter).toHaveBeenCalledTimes(1)
    expect(LambdaAdapter).toHaveBeenCalledWith(lambdaInstance)

    const repoInstance = (CartRepository as jest.Mock).mock.instances[0]
    const lambdaAdapterInstance = (LambdaAdapter as jest.Mock).mock.instances[0]

    expect(OpenCartUseCase).toHaveBeenCalledTimes(1)
    expect(OpenCartUseCase).toHaveBeenCalledWith(repoInstance, lambdaAdapterInstance)

    expect(factory.usecase).toBe(
      (OpenCartUseCase as jest.Mock).mock.instances[0]
    )
  })
})
