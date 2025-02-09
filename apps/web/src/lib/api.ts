import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@repo/openapi-ts";

export const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:3000",
  credentials: "include"
});

const api = createClient(fetchClient);

export default api;