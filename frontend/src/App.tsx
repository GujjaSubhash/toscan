import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Loading from "@/pages/Loading";
import Results from "@/pages/Results";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F4F4F5]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/results/:documentId" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
