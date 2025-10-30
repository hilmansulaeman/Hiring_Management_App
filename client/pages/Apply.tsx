import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { isValid, parseISO, format } from "date-fns";
import { WebcamCaptureModal } from "@/components/WebcamCaptureModal";
import { DialogTrigger } from "@/components/ui/dialog";
import { PhoneCountrySelect } from "@/components/PhoneCountrySelect";
import { DateOfBirthPicker } from "@/components/ui/date-of-birth-picker";
import { toast } from "@/components/ui/use-toast";

export default function Apply() {
  const { jobId } = useParams<{ jobId: string }>(); // Extract jobId from URL

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    domicile: "",
    phone: "",
    email: "",
    linkedin: "",
    photoUrl: "",
    countryDialCode: "+62", // Default to Indonesia
  });
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCountryChange = useCallback((dialCode: string) => {
    setFormData((prevData) => ({ ...prevData, countryDialCode: dialCode }));
  }, []);

  const handlePhotoCapture = (imageData: string) => {
    setFormData({ ...formData, photoUrl: imageData });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({}); // Clear previous errors

    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is missing. Cannot submit application.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.countryDialCode + formData.phone,
        dob: formData.dob,
        domicile: formData.domicile,
        gender: formData.gender === "female" ? "Female" : "Male", // Map to "Female" | "Male"
        linkedin: formData.linkedin,
        photoUrl: formData.photoUrl || undefined,
      };

      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const errorData = await response.json();
        setFieldErrors(errorData.fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please correct the highlighted fields.",
          variant: "destructive",
        });
      } else if (response.ok) {
        toast({
          title: "Application submitted",
          description: "Your application has been successfully submitted.",
        });
        // Option (a): stay on page with cleared errors (already done by setFieldErrors({}))
        // Option (b): redirect to a simple success screen
        navigate('/apply/success');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      toast({
        title: "Error",
        description: `Failed to submit application: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-20">
      <Header />

      <main className="flex-1 flex items-start justify-center py-[50px] px-4">
        <div className="w-full max-w-[700px] bg-white border border-neutral-40 rounded-lg">
          <div className="p-10 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <Link
                to="/"
                className="inline-flex p-1 justify-center items-center gap-1 rounded-lg border border-neutral-40 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.12)]"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8332 10H4.1665"
                    stroke="#1D1F20"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.99984 15.8337L4.1665 10.0003L9.99984 4.16699"
                    stroke="#333333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <div className="flex-1 flex items-start gap-2">
                <h1 className="flex-1 text-lg font-bold text-neutral-100 leading-7">
                  Apply Front End at Ugblue
                </h1>
                <p className="text-sm text-neutral-90 leading-6">
                  ℹ️ This field required to fill
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 flex flex-col gap-4">
              <p className="text-xs font-bold text-destructive leading-5">
                * Required
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-90 leading-5">
                  Photo Profile
                </label>
                <div
                  className={`w-32 h-32 rounded-2xl bg-cover bg-center bg-neutral-40 ${fieldErrors.photoUrl ? "border-2 border-destructive" : ""}`}
                  style={{
                    backgroundImage: `url(${formData.photoUrl || "/placeholder.svg"})`,
                  }}
                ></div>
                <WebcamCaptureModal
                  open={isWebcamModalOpen}
                  onOpenChange={setIsWebcamModalOpen}
                  onCapture={handlePhotoCapture}
                  // poseIndex={...} // Add poseIndex prop if external pose detection is implemented
                  // autoCaptureOnPoseComplete={true} // Enable auto-capture if needed
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex px-4 py-1 justify-center items-center gap-1 rounded-lg border border-neutral-40 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.12)] w-fit"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.6665 10.6663L2.6665 11.333C2.6665 12.4376 3.56193 13.333 4.6665 13.333L11.3332 13.333C12.4377 13.333 13.3332 12.4376 13.3332 11.333L13.3332 10.6663M10.6665 5.33301L7.99984 2.66634M7.99984 2.66634L5.33317 5.33301M7.99984 2.66634L7.99984 10.6663"
                          stroke="#111827"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm font-bold text-neutral-100 leading-6">
                        Take a Picture
                      </span>
                    </button>
                  </DialogTrigger>
                </WebcamCaptureModal>
                {fieldErrors.photoUrl && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.photoUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Full name<span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`h-10 px-4 py-2 rounded-lg border-2 ${fieldErrors.fullName ? "border-destructive" : "border-neutral-40"} bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 focus:outline-none focus:border-primary`}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <DateOfBirthPicker
                id="dob"
                label="Date of birth"
                required
                value={formData.dob ? parseISO(formData.dob) : null}
                onChange={(date) =>
                  setFormData({ ...formData, dob: date && isValid(date) ? format(date, "yyyy-MM-dd") : "" })
                }
                hasError={!!fieldErrors.dob}
              />
              {fieldErrors.dob && (
                <p className="text-xs text-destructive leading-5">
                  {fieldErrors.dob}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Pronoun (gender)<span className="text-destructive">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      className={`w-6 h-6 accent-neutral-90 ${fieldErrors.gender ? "border-destructive" : ""}`}
                      checked={formData.gender === "female"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    />
                    <span className="text-sm text-neutral-90 leading-6">
                      She/her (Female)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      className={`w-6 h-6 accent-neutral-90 ${fieldErrors.gender ? "border-destructive" : ""}`}
                      checked={formData.gender === "male"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    />
                    <span className="text-sm text-neutral-90 leading-6">
                      He/him (Male)
                    </span>
                  </label>
                </div>
                {fieldErrors.gender && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Domicile<span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Choose your domicile"
                    className={`h-10 px-4 py-2 rounded-lg border-2 ${fieldErrors.domicile ? "border-destructive" : "border-neutral-40"} bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 w-full focus:outline-none focus:border-primary`}
                    value={formData.domicile}
                    onChange={(e) =>
                      setFormData({ ...formData, domicile: e.target.value })
                    }
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#1D1F20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {fieldErrors.domicile && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.domicile}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Phone number<span className="text-destructive">*</span>
                </label>
                <div className={`flex rounded-lg border-2 ${fieldErrors.phone ? "border-destructive" : "border-neutral-40"} bg-white focus-within:border-primary`}>
                  <PhoneCountrySelect onCountryChange={handleCountryChange} defaultDialCode={formData.countryDialCode} />
                  <span className="flex items-center pl-2 text-sm text-neutral-90 leading-6">{formData.countryDialCode}</span>
                  <input
                    type="tel"
                    placeholder="81XXXXXXXXX"
                    className="flex-1 h-10 px-2 py-2 bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 outline-none rounded-r-lg"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Email<span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`h-10 px-4 py-2 rounded-lg border-2 ${fieldErrors.email ? "border-destructive" : "border-neutral-40"} bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 focus:outline-none focus:border-primary`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-90 leading-5">
                  Link Linkedin<span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className={`h-10 px-4 py-2 rounded-lg border-2 ${fieldErrors.linkedin ? "border-destructive" : "border-neutral-40"} bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 focus:outline-none focus:border-primary`}
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                />
                {fieldErrors.linkedin && (
                  <p className="text-xs text-destructive leading-5">
                    {fieldErrors.linkedin}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="px-10 py-6 border-t border-neutral-40 bg-white">
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-1.5 rounded-lg bg-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.12)] text-base font-bold text-white leading-7 hover:bg-primary-hover transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
