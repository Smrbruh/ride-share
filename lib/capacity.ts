export function getVehicleCapacity(typeName: string): number {
  const normalized = typeName.trim().toLowerCase();
  if (normalized === "van") return 8;
  if (normalized === "comfort") return 4;
  if (normalized === "economy") return 4;
  return 4;
}
