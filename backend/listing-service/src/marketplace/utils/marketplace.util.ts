export function padPrice(price: number): string {
  const scaled = Math.floor(price * 10 ** 2);
  return scaled.toString().padStart(1, "0");
}

export function getDtoKeys<T extends object>(dtoClass: new () => T): (keyof T)[] {
  const instance = new dtoClass();
  return Object.keys(instance).map((k) => k as keyof T);
}
