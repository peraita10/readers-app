export type ServiceName =
  | "gateway"
  | "identity"
  | "catalog"
  | "reading"
  | "community";

export interface HealthResponse {
  service: ServiceName;
  status: "ok";
  timestamp: string;
}