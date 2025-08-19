import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <div style={{padding: 20, textAlign: 'center'}}>
    <h1>App Loading...</h1>
    <p>Healthcheck successful</p>
  </div>
);
