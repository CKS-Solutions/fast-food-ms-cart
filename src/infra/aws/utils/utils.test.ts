import { newAwsConfig, AwsRegion, AwsStage } from './utils'

const LOCALSTACK_ENDPOINT = 'http://host.docker.internal:4566'

describe('newAwsConfig', () => {
  it('should return only region when stage is Prod', () => {
    const config = newAwsConfig(AwsRegion.USEast1, AwsStage.Prod)

    expect(config).toEqual({
      region: AwsRegion.USEast1,
    })

    expect(config.endpoint).toBeUndefined()
  })

  it('should return region and localstack endpoint when stage is Local', () => {
    const config = newAwsConfig(AwsRegion.USEast1, AwsStage.Local)

    expect(config).toEqual({
      region: AwsRegion.USEast1,
      endpoint: LOCALSTACK_ENDPOINT,
    })
  })

  it('should support different regions', () => {
    const config = newAwsConfig(AwsRegion.USWest2, AwsStage.Local)

    expect(config.region).toBe(AwsRegion.USWest2)
    expect(config.endpoint).toBe(LOCALSTACK_ENDPOINT)
  })
})
