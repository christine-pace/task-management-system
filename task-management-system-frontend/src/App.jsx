import { useState } from "react";
import Tab from "./components/Tabs";

export default function App() {
  const [refresh] = useState(false);

  return (
    <div>
      <Tab refresh={refresh} />
    </div>
  );
}