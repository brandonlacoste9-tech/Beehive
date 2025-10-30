import { jsonResponse, errorResponse } from './response';

describe('jsonResponse', () => {
  it('returns correct headers and body', () => {
    const data = { ok: true };
    const res = jsonResponse(data, 201);
    expect(res.statusCode).toBe(201);
    expect(res.headers['Content-Type']).toBe('application/json');
    expect(res.body).toBe(JSON.stringify(data));
  });

  it('defaults to 200 if statusCode is omitted', () => {
    const data = { foo: 'bar' };
    const res = jsonResponse(data);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe('application/json');
    expect(res.body).toBe(JSON.stringify(data));
  });

  it('supports custom headers', () => {
  const data = { foo: 'bar' };
  const res = jsonResponse(data, 202, { 'X-Test': 'yes', 'Content-Type': 'custom/type' });
  expect(res.statusCode).toBe(202);
  expect((res.headers as Record<string, string>)['X-Test']).toBe('yes');
  // Should override default Content-Type if provided
  expect((res.headers as Record<string, string>)['Content-Type']).toBe('custom/type');
  expect(res.body).toBe(JSON.stringify(data));
  });

  it('returns stringified null for null payload', () => {
    const res = jsonResponse(null);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('null');
  });

  it('handles array payloads', () => {
    const arr = [1, 2, 3];
    const res = jsonResponse(arr, 200);
    expect(res.body).toBe(JSON.stringify(arr));
  });

  it('sets CORS headers if specified', () => {
  const data = { foo: 123 };
  const res = jsonResponse(data, 200, { 'Access-Control-Allow-Origin': '*' });
  expect((res.headers as Record<string, string>)['Access-Control-Allow-Origin']).toBe('*');
  });
});

describe('errorResponse', () => {
  it('returns error shape and status', () => {
    const res = errorResponse('fail', 400);
    expect(res.statusCode).toBe(400);
    expect(res.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body)).toEqual({ error: 'fail' });
  });

  it('stringifies non-string errors', () => {
    const res = errorResponse({ msg: 'bad' } as any, 500);
    expect(res.statusCode).toBe(500);
    // Should coerce error to string
    expect(JSON.parse(res.body)).toEqual({ error: '[object Object]' });
  });

  it('defaults to 500 if statusCode is omitted', () => {
    const res = errorResponse('fail');
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'fail' });
  });

  it('supports custom headers', () => {
  const res = errorResponse('fail', 401, { 'X-Err': 'yes', 'Content-Type': 'custom/type' });
  expect(res.statusCode).toBe(401);
  expect((res.headers as Record<string, string>)['X-Err']).toBe('yes');
  expect((res.headers as Record<string, string>)['Content-Type']).toBe('custom/type');
  expect(JSON.parse(res.body)).toEqual({ error: 'fail' });
  });
});
