export function toPlain(obj: object|object[]): object|object[] {
  return JSON.parse(JSON.stringify(obj));
}

