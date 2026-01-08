export interface ILambdaAdapter {
  invokeEvent<T>(functionName: string, payload: T): Promise<void>;
  invoke<T>(functionName: string, payload: T): Promise<any>;
}