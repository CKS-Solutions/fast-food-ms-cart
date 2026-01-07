import { getRegion, getStage } from './env';
import { AwsRegion, AwsStage } from '@aws/utils';

describe('getRegion', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should return region from environment variable', () => {
    process.env.REGION = AwsRegion.USWest2;

    const region = getRegion();

    expect(region).toBe(AwsRegion.USWest2);
  });

  it('should return default region when REGION is undefined', () => {
    delete process.env.REGION;

    const region = getRegion();

    expect(region).toBe(AwsRegion.USEast1);
  });

  it('should return default region when REGION is empty string', () => {
    process.env.REGION = '';

    const region = getRegion();

    expect(region).toBe(AwsRegion.USEast1);
  });
});

describe('getStage', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should return stage from environment variable', () => {
    process.env.STAGE = AwsStage.Prod;

    const stage = getStage();

    expect(stage).toBe(AwsStage.Prod);
  });

  it('should return default stage when STAGE is undefined', () => {
    delete process.env.STAGE;

    const stage = getStage();

    expect(stage).toBe(AwsStage.Local);
  });

  it('should return default stage when STAGE is empty string', () => {
    process.env.STAGE = '';

    const stage = getStage();

    expect(stage).toBe(AwsStage.Local);
  });
});
