import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { apiRequest } from "./lib/api";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// Run once for each new document, before any page can restore an old session.
async function startApplication() {
  root.render(<p role="status">로그인 상태를 확인하고 있습니다.</p>);
  try {
    await apiRequest("/auth/bootstrap", { method: "POST" });
    root.render(<BrowserRouter><App /></BrowserRouter>);
  } catch {
    root.render(<div role="alert"><p>서버에 연결하지 못했습니다. 연결 후 다시 시도해 주세요.</p><button onClick={startApplication}>다시 시도</button></div>);
  }
}

void startApplication();
