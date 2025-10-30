import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  domicile: string;
  gender: string;
  linkedin: string;
  photoUrl?: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Application | null;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ isOpen, onClose, candidate }) => {
  if (!candidate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>
            Detailed information about {candidate.fullName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-4">
            {candidate.photoUrl ? (
              <img src={candidate.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-3xl">{candidate.fullName ? candidate.fullName.charAt(0) : 'N/A'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="text-xl font-semibold">{candidate.fullName}</h3>
              <p className="text-gray-500">{candidate.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Phone Number:</p>
              <p className="text-base">{candidate.phone || 'N/A'}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Gender:</p>
              <p className="text-base">{candidate.gender || 'N/A'}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
              <p className="text-base">{candidate.dob ? format(new Date(candidate.dob), 'yyyy-MM-dd') : 'N/A'}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Domicile:</p>
              <p className="text-base">{candidate.domicile || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-700">LinkedIn:</p>
              {candidate.linkedin ? (
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-base">
                  {candidate.linkedin}
                </a>
              ) : (
                <p className="text-base">N/A</p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-700">Applied At:</p>
              <p className="text-base">{format(new Date(candidate.createdAt), 'yyyy-MM-dd HH:mm')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailModal;
