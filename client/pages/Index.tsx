import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-4xl font-bold text-neutral-900">Welcome</h1>
          <p className="text-lg text-neutral-600">Choose your portal:</p>
          <div className="flex space-x-4">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-custom-blue rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
            >
              Admin Portal
            </Link>
            <Link
              to="/client"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-custom-blue border border-custom-blue rounded-lg hover:bg-custom-blue hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
