import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CandidateDetailModal from '@/components/CandidateDetailModal';

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

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
  applications: Application[]; // Changed from candidates to applications
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string; // Assuming it comes as a string from API
  domicile: string;
  gender: string;
  linkedin: string;
  photoUrl?: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

const ManageJobPage: React.FC = () => {
  const params = useParams<{ jobId: string }>();
  const id = params.jobId;
  console.log("useParams() object:", params);
  console.log("Job ID from URL (extracted):", id);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  const { data: job, isLoading, error } = useQuery<Job, Error>({
    queryKey: ['job', id],
    queryFn: async () => {
      console.log("Fetching job with ID:", id);
      try {
        const response = await axios.get(`/api/jobs/${id}`);
        console.log("API Response for job:", response.data);
        return response.data;
      } catch (fetchError) {
        console.error("Error fetching job:", fetchError);
        throw fetchError; // Re-throw to let useQuery handle the error state
      }
    },
    enabled: !!id,
  });

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications((prevSelected) =>
      prevSelected.includes(applicationId)
        ? prevSelected.filter((appId) => appId !== applicationId)
        : [...prevSelected, applicationId]
    );
  };

  const handleSelectAllApplications = () => {
    if (job && selectedApplications.length === job.applications.length) {
      setSelectedApplications([]);
    } else if (job) {
      setSelectedApplications(job.applications.map((application) => application.id));
    }
  };

  const handleOpenModal = (candidate: Application) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("job:", job);

  if (isLoading) return <div>Loading job details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!job) return <div>Job not found</div>;

  console.log("Job data (after checks):", job);
  console.log("Applications data (after checks):", job.applications);

  const hasApplications = job.applications && job.applications.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/admin" className="hover:underline">Job List</Link>
          <span>{'>'}</span>
          <span className="font-semibold text-gray-900">Manage Candidate</span>
        </div>
        <Avatar>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </header>

      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">{job.title}</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {hasApplications ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    <Checkbox
                      checked={selectedApplications.length === job.applications.length}
                      onCheckedChange={handleSelectAllApplications}
                    />
                  </TableHead>
                  <TableHead>PHOTO</TableHead>
                  <TableHead>FULL NAME</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>PHONE NUMBER</TableHead>
                  <TableHead>GENDER</TableHead>
                  <TableHead>DATE OF BIRTH</TableHead>
                  <TableHead>DOMICILE</TableHead>
                  <TableHead>LINKEDIN</TableHead>
                  <TableHead>APPLIED AT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.applications.map((application) => (
                  <TableRow key={application.id} onClick={() => handleOpenModal(application)} className="cursor-pointer hover:bg-gray-100">
                    <TableCell onClick={(e) => e.stopPropagation()}> {/* Prevent modal from opening when checkbox is clicked */}
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={() => handleSelectApplication(application.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {application.photoUrl ? (
                        <img src={application.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Avatar>
                          <AvatarFallback>{application.fullName ? application.fullName.charAt(0) : 'N/A'}</AvatarFallback>
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{application.fullName}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.phone || 'N/A'}</TableCell>
                    <TableCell>{application.gender || 'N/A'}</TableCell>
                    <TableCell>{application.dob ? format(new Date(application.dob), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                    <TableCell>{application.domicile || 'N/A'}</TableCell>
                    <TableCell>
                      {application.linkedin ? (
                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                          LinkedIn
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(application.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <img src="/Empty State.svg" alt="No applications found" className="max-w-xs mb-4" />
              <p className="text-gray-500 text-lg">No applications have been submitted for this job yet.</p>
            </div>
          )}
        </div>
      </main>

      <CandidateDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        candidate={selectedCandidate}
      />
    </div>
  );
};

export default ManageJobPage;
