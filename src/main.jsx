import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "i18n/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "simplebar-react/dist/simplebar.min.css";

import "styles/index.css";


const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
