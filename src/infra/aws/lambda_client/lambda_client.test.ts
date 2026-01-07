import { AwsRegion, AwsStage } from '../utils'

const mockConfig = { region: 'us-east-1' }

jest.mock('../utils', () => ({
  AwsRegion: {
    USEast1: 'us-east-1',
  },
  AwsStage: {
    Local: 'local',
  },
  newAwsConfig: jest.fn(() => mockConfig),
}))

jest.mock('@aws-sdk/client-lambda', () => ({
  LambdaClient: jest.fn(),
}))

import { LambdaClientWrapper } from './lambda_client'
import { newAwsConfig } from '../utils'
import { LambdaClient } from '@aws-sdk/client-lambda'

describe('LambdaClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create LambdaClient with aws config based on region and stage', () => {
    new LambdaClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(LambdaClient).toHaveBeenCalledWith(mockConfig)
  })
})
