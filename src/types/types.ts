export interface RequestResponse {
  type: string;
  data: string;
  id: 0;
}

export type Handler = (req: RequestResponse) => RequestResponse;

export type RequestData = {
  name: string;
  password: string;
};
