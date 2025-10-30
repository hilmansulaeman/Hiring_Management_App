import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import JobOpeningModal from "@/components/JobOpeningModal"; // Import the new component
import { Link } from 'react-router-dom';
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // Import Dialog and DialogTrigger

interface Job {
  id: string;
  slug: string;
  title: string;
  jobType: string; // Added jobType
  jobStatus: string; // Renamed from status to jobStatus
  salary_range: {
    min: number;
    max: number;
    currency: string;
    display_text: string;
  };
  list_card: {
    badge: string;
    started_on_text: string;
    cta: string;
  };
  description: string;
  requirements: string;
  location: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  candidates: any[];
}

const AdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: { data: Job[] } = await response.json(); // Expect data wrapped in 'data'
      setJobs(result.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async (newJobData: { title: string; type: string; description: string; numCandidates: number; salaryMin: string; salaryMax: string; }) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newJobData.title,
          description: newJobData.description,
          requirements: "", // Default empty for now
          salaryMin: parseFloat(newJobData.salaryMin.replace(/\./g, '').replace(',', '.')) || 0.0,
          salaryMax: parseFloat(newJobData.salaryMax.replace(/\./g, '').replace(',', '.')) || 0.0,
          location: "Jakarta Selatan", // Default location
          jobType: newJobData.type, // 'type' from modal maps to 'jobType'
          jobStatus: "draft", // Default jobStatus for new jobs
          company: "Rakamin", // Default company
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      fetchJobs(); // Re-fetch jobs to update the list
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const getStatusClass = (jobStatus: string) => {
    switch (jobStatus) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job List</h1>
        <Avatar>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </header>

      <main className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Input
              type="text"
              placeholder="Search by job details"
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          {/* Job Listings */}
          <div className="flex flex-col gap-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="p-4 shadow-md">
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded-full font-semibold ${getStatusClass(job.jobStatus ? job.jobStatus.toLowerCase() : '')}`}>
                        {job.jobStatus}
                      </span>
                      <span className="text-gray-600">{job.list_card.started_on_text}</span>
                    </div>
                    <h2 className="text-xl font-bold">{job.title}</h2>
                    <p className="text-gray-700">{job.salary_range.display_text}</p>
                    <p className="text-gray-500 text-sm">ID: {job.id}</p> {/* Display job ID */}
                    <div className="flex justify-end">
                      <Button asChild className="bg-[#01959F] hover:bg-[#01959F]/90 text-white px-4 py-2 rounded-md">
                        <Link to={`/admin/manage-job/${job.id}`} onClick={() => console.log('Navigating to job ID:', job.id)}>
                          Manage Job
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <img src="/kosong managejob.svg" alt="No jobs" className="max-w-xs mb-4" />
                <p className="text-gray-500 text-lg">No jobs available. Create a new job to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Recruit Card */}
        <div className="md:col-span-1">
          <Card className="bg-black text-white p-6 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2">Recruit the best candidates</CardTitle>
              <CardDescription className="text-gray-300">
                Create jobs, invite, and hire with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button type="button" className="bg-[#01959F] hover:bg-[#01959F]/90 text-white px-6 py-3 rounded-md w-full">
                    Create a new job
                  </Button>
                </DialogTrigger>
                <JobOpeningModal
                  isOpen={isModalOpen}
                  onOpenChange={setIsModalOpen}
                  onSave={handleSaveJob}
                  // No triggerButton prop needed here as DialogTrigger is used directly
                />
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
