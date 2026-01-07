import {
  HTTPStatus,
  HTTPBadRequest,
  HTTPNotFound,
  HTTPConflict,
  HTTPPreconditionFailed,
  HTTPInternalServerError,
  HTTPSuccessResponse,
} from './http';

describe('HTTPError classes', () => {
  it('should return BadRequest response', () => {
    const error = new HTTPBadRequest('invalid request');

    const response = error.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.BadRequest);
    expect(response.headers).toEqual({
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(response.body)).toEqual({
      message: 'invalid request',
    });
  });

  it('should return NotFound response', () => {
    const error = new HTTPNotFound('resource not found');

    const response = error.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.NotFound);
    expect(JSON.parse(response.body)).toEqual({
      message: 'resource not found',
    });
  });

  it('should return Conflict response', () => {
    const error = new HTTPConflict('conflict detected');

    const response = error.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.Conflict);
    expect(JSON.parse(response.body)).toEqual({
      message: 'conflict detected',
    });
  });

  it('should return PreconditionFailed response', () => {
    const error = new HTTPPreconditionFailed('precondition failed');

    const response = error.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.PreconditionFailed);
    expect(JSON.parse(response.body)).toEqual({
      message: 'precondition failed',
    });
  });

  it('should return InternalServerError response', () => {
    const error = new HTTPInternalServerError('unexpected error');

    const response = error.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.InternalServerError);
    expect(JSON.parse(response.body)).toEqual({
      message: 'unexpected error',
    });
  });
});

describe('HTTPSuccessResponse', () => {
  it('should return OK response with data', () => {
    const data = { id: '123', status: 'PAID' };

    const success = new HTTPSuccessResponse(data);
    const response = success.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.OK);
    expect(response.headers).toEqual({
      'Content-Type': 'application/json',
    });

    expect(JSON.parse(response.body)).toEqual({
      data,
    });
  });

  it('should handle primitive data', () => {
    const success = new HTTPSuccessResponse('ok');
    const response = success.toLambdaResponse();

    expect(response.statusCode).toBe(HTTPStatus.OK);
    expect(JSON.parse(response.body)).toEqual({
      data: 'ok',
    });
  });
});
