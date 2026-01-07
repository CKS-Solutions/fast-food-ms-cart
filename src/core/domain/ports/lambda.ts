export interface ILambdaAdapter {
  invokeEvent<T>(functionName: string, payload: T): Promise<void>;
}