import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  jobType: string;
  jobStatus: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  candidates: any[];
}

export default function Index() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: { data: Job[] } = await response.json();
      setJobs(result.data);
      if (result.data.length > 0) {
        setSelectedJob(result.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-10">
            <img src="/Empty State.svg" alt="No job openings available" className="max-w-xs mb-4" />
            <p className="text-gray-500 text-lg text-center">No job openings available.</p>
            <p className="text-gray-500 text-lg text-center">Please wait for the next batch of openings.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedJob?.id === job.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src="/logo.svg"
                      alt={job.company}
                      className="w-10 h-10 rounded border border-neutral-200"
                    />
                    <div className="flex-1">
                      <h2 className="text-md font-bold text-neutral-900">{job.title}</h2>
                      <p className="text-sm text-neutral-600">{job.company}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            {selectedJob && (
              <div className="border border-neutral-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <img
                    src="/logo.svg"
                    alt={selectedJob.company}
                    className="w-12 h-12 rounded border border-neutral-200"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900">{selectedJob.title}</h2>
                        <p className="text-md text-neutral-600">{selectedJob.company}</p>
                      </div>
                      <Link
                        to={`/apply/${selectedJob.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-custom-blue rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                      >
                        Apply
                      </Link>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{selectedJob.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                        <span>{selectedJob.currency} {selectedJob.salaryMin} - {selectedJob.salaryMax}</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedJob.jobType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-neutral-800">Job Description</h3>
                  <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-neutral-800">Requirements</h3>
                  <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                    {selectedJob.requirements}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
