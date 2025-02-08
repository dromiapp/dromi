import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@repo/openapi-ts";

const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:3000",
});

const api = createClient(fetchClient);

export default api;