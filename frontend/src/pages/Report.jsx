import Navbar from "../components/Navbar";
import ResultDashboard from "../components/ResultDashboard";

export default function Report({ result, onBack }) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827]">

      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8 md:pt-10">

        {/* Top navigation */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            onClick={onBack}
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.07] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[0.12] hover:text-[#111827]"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>

            New analysis
          </button>

          <div className="text-xs text-[#9CA3AF]">
            CardioSense AI · Clinical Analysis Workspace
          </div>

        </div>

        <ResultDashboard result={result} />

      </main>
    </div>
  );
}