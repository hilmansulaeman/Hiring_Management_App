import { Link } from "react-router-dom";
import Header from "@/components/Header";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-20">
      <Header />

      <main className="flex-1 flex items-center justify-center py-[50px] px-4">
        <div className="w-full max-w-[700px] bg-white border border-neutral-40 rounded-lg p-10 flex flex-col items-center text-center gap-6">
          <img src="/sukses.svg" alt="Success" className="w-52 h-52" />
          <h1 className="text-2xl font-bold text-neutral-100 leading-8">
            Application Submitted Successfully!
          </h1>
          <p className="text-base text-neutral-90 leading-6">
            Thank you for applying. We will review your application and get back to you soon.
          </p>
          <Link
            to="/"
            className="inline-flex px-6 py-2 justify-center items-center gap-2 rounded-lg bg-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.12)] text-base font-bold text-white leading-7 hover:bg-primary-hover transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
