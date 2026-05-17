export interface SocketData {
  userId: string;
  name: string;
  nucleoType: string | null;
  events: Set<string>;
  ghost: Set<string>;
}
