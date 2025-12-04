import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "i18n/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "simplebar-react/dist/simplebar.min.css";

import "styles/index.css";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true, // Selalu refetch saat component mount
      refetchOnWindowFocus: false, // Tidak refetch saat window focus
      retry: 1, // Retry 1 kali jika gagal
      staleTime: 0, // Data langsung dianggap stale (perlu refetch)
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
