export interface IResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: IValidationError[];
  timestamp: string;
  path: string;
}

export interface IValidationError {
  field: string;
  message: string;
}
