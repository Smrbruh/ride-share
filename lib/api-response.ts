import { NextResponse } from "next/server";
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
export function failure(message: string, status = 400, error = "BAD_REQUEST", details?: unknown) {
  return NextResponse.json({ success: false, error, message, details }, { status });
}
