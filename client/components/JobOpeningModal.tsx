import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogOverlay
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface JobOpeningModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (newJob: { title: string; type: string; description: string; numCandidates: number; salaryMin: string; salaryMax: string; }) => void;
}

const JobOpeningModal: React.FC<JobOpeningModalProps> = ({ isOpen, onOpenChange, onSave }) => {
    const [jobName, setJobName] = useState('');
    const [jobType, setJobType] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [numCandidates, setNumCandidates] = useState<number>(0);
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');

    const [genderStatus, setGenderStatus] = useState<'mandatory' | 'optional' | 'off'>('mandatory');
    const [domicileStatus, setDomicileStatus] = useState<'mandatory' | 'optional' | 'off'>('mandatory');
    const [phoneNumberStatus, setPhoneNumberStatus] = useState<'mandatory' | 'optional' | 'off'>('mandatory');
    const [linkedinLinkStatus, setLinkedinLinkStatus] = useState<'mandatory' | 'optional' | 'off'>('mandatory');
    const [dateOfBirthStatus, setDateOfBirthStatus] = useState<'mandatory' | 'optional' | 'off'>('mandatory');

    const getButtonClass = (currentStatus: string, buttonType: string) =>
        currentStatus === buttonType ? 'bg-teal-500 text-white' : '';

    const handleSubmit = () => {
        const newJob = {
            title: jobName,
            type: jobType,
            description: jobDescription,
            numCandidates: numCandidates,
            salaryMin: salaryMin,
            salaryMax: salaryMax,
        };
        onSave(newJob);
        onOpenChange(false); // Close modal after saving
        // Clear form fields
        setJobName('');
        setJobType('');
        setJobDescription('');
        setNumCandidates(0);
        setSalaryMin('');
        setSalaryMax('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* DialogTrigger is now handled in AdminPage.tsx */}
            <DialogContent className="sm:max-w-[600px] rounded-xl bg-white shadow-2xl max-h-[653px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Job Opening</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new job opening.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobName" className="text-base font-semibold">
                            Job Name<span className="text-red-500">*</span>
                        </Label>
                        <Input id="jobName" placeholder="Ex. Front End Engineer" value={jobName} onChange={(e) => setJobName(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="jobType" className="text-base font-semibold">
                            Job Type<span className="text-red-500">*</span>
                        </Label>
                        <Select value={jobType} onValueChange={setJobType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="jobDescription" className="text-base font-semibold">
                            Job Description<span className="text-red-500">*</span>
                        </Label>
                        <Textarea id="jobDescription" placeholder="Write a brief description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="numCandidates" className="text-base font-semibold">
                            Number of Candidate Needed<span className="text-red-500">*</span>
                        </Label>
                        <Input id="numCandidates" type="number" placeholder="Ex. 2" value={numCandidates} onChange={(e) => setNumCandidates(Number(e.target.value))} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-base font-semibold">Job Salary</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                                <Input className="pl-9" placeholder="7.000.000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                                <Input className="pl-9" placeholder="8.000.000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Minimum Profile Information Required */}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold mb-4">Minimum Profile Information Required</h3>
                        <div className="grid gap-4">
                            {/* Full name */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Full name</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-teal-500 text-white">Mandatory</Button>
                                <Button variant="outline" size="sm" disabled>Optional</Button>
                                <Button variant="outline" size="sm" disabled>Off</Button>
                                </div>
                            </div>
                            {/* Photo Profile */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Photo Profile</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-teal-500 text-white">Mandatory</Button>
                                    <Button variant="outline" size="sm" disabled>Optional</Button>
                                    <Button variant="outline" size="sm" disabled>Off</Button>
                                </div>
                            </div>
                            {/* Gender */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Gender</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setGenderStatus('mandatory')} className={getButtonClass(genderStatus, 'mandatory')}>Mandatory</Button>
                                    <Button variant="outline" size="sm" onClick={() => setGenderStatus('optional')} className={getButtonClass(genderStatus, 'optional')}>Optional</Button>
                                    <Button variant="outline" size="sm" onClick={() => setGenderStatus('off')} className={getButtonClass(genderStatus, 'off')}>Off</Button>
                                </div>
                            </div>
                            {/* Domicile */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Domicile</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setDomicileStatus('mandatory')} className={getButtonClass(domicileStatus, 'mandatory')}>Mandatory</Button>
                                    <Button variant="outline" size="sm" onClick={() => setDomicileStatus('optional')} className={getButtonClass(domicileStatus, 'optional')}>Optional</Button>
                                    <Button variant="outline" size="sm" onClick={() => setDomicileStatus('off')} className={getButtonClass(domicileStatus, 'off')}>Off</Button>
                                </div>
                            </div>
                            {/* Email */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Email</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-teal-500 text-white">Mandatory</Button>
                                    <Button variant="outline" size="sm" disabled>Optional</Button>
                                    <Button variant="outline" size="sm" disabled>Off</Button>
                                </div>
                            </div>
                            {/* Phone number */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Phone number</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPhoneNumberStatus('mandatory')} className={getButtonClass(phoneNumberStatus, 'mandatory')}>Mandatory</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPhoneNumberStatus('optional')} className={getButtonClass(phoneNumberStatus, 'optional')}>Optional</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPhoneNumberStatus('off')} className={getButtonClass(phoneNumberStatus, 'off')}>Off</Button>
                                </div>
                            </div>
                            {/* LinkedIn Link */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">LinkedIn Link</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setLinkedinLinkStatus('mandatory')} className={getButtonClass(linkedinLinkStatus, 'mandatory')}>Mandatory</Button>
                                    <Button variant="outline" size="sm" onClick={() => setLinkedinLinkStatus('optional')} className={getButtonClass(linkedinLinkStatus, 'optional')}>Optional</Button>
                                    <Button variant="outline" size="sm" onClick={() => setLinkedinLinkStatus('off')} className={getButtonClass(linkedinLinkStatus, 'off')}>Off</Button>
                                </div>
                            </div>
                            {/* Date of birth */}
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Date of birth</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setDateOfBirthStatus('mandatory')} className={getButtonClass(dateOfBirthStatus, 'mandatory')}>Mandatory</Button>
                                    <Button variant="outline" size="sm" onClick={() => setDateOfBirthStatus('optional')} className={getButtonClass(dateOfBirthStatus, 'optional')}>Optional</Button>
                                    <Button variant="outline" size="sm" onClick={() => setDateOfBirthStatus('off')} className={getButtonClass(dateOfBirthStatus, 'off')}>Off</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" onClick={handleSubmit} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                        Publish Job
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default JobOpeningModal;
