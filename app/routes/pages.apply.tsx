import { useState } from 'react';
import { type MetaFunction } from '@shopify/remix-oxygen';
import { AnimatedBackground } from '~/components/AnimatedBackground';

export const meta: MetaFunction = () => {
  return [{ title: 'Employment Application - ZDT\'s Amusement Park' }];
};

export default function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [employerCount, setEmployerCount] = useState(2);

  const addEmployer = () => {
    setEmployerCount(prev => prev + 1);
  };

  const removeEmployer = (indexToRemove: number) => {
    if (employerCount > 1) {
      setEmployerCount(prev => prev - 1);
      // Note: In a real app, you'd want to handle form data cleanup here
    }
  };

  const renderEmployerForm = (employerNumber: number) => {
    return (
      <div key={employerNumber} className="mb-6 p-4 border-2 border-gray-300 rounded-lg relative">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-bold text-[var(--color-brand-dark)]">
            Previous Employer {employerNumber}
          </h4>
          {employerCount > 1 && (
            <button
              type="button"
              onClick={() => removeEmployer(employerNumber)}
              className="text-red-600 hover:text-red-800 font-bold text-lg"
              aria-label={`Remove employer ${employerNumber}`}
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
              Company Name
            </label>
            <input
              type="text"
              name={`employer${employerNumber}Name`}
              className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
              Position
            </label>
            <input
              type="text"
              name={`employer${employerNumber}Position`}
              className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
              Start Date
            </label>
            <input
              type="date"
              name={`employer${employerNumber}StartDate`}
              className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
              End Date
            </label>
            <input
              type="date"
              name={`employer${employerNumber}EndDate`}
              className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
              Ending Pay
            </label>
            <input
              type="text"
              name={`employer${employerNumber}Pay`}
              className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
            Reason for Leaving
          </label>
          <input
            type="text"
            name={`employer${employerNumber}Reason`}
            className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
          />
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    
    // Build comprehensive message
    const message = `
NEW EMPLOYMENT APPLICATION SUBMISSION

PERSONAL INFORMATION:
• Date of Application: ${formData.get('applicationDate')}
• Name: ${formData.get('firstName')} ${formData.get('lastName')}
• Address: ${formData.get('address')}
• City, State, ZIP: ${formData.get('city')}, ${formData.get('state')} ${formData.get('zipCode')}
• Email: ${formData.get('email')}
• Phone: ${formData.get('phone')}

ELIGIBILITY:
• Age: ${formData.get('age')} years old
• US Citizen/Work Eligible: ${formData.get('workEligible')}
• TX Driver's License: ${formData.get('driversLicense')}
• Currently in School: ${formData.get('currentlyInSchool')}
• Last Grade Completed: ${formData.get('lastGradeCompleted')}

EMPLOYMENT PREFERENCES:
• Looking for Part-time Job: ${formData.get('partTimeInterest')}
• Desired Pay: ${formData.get('desiredPay')}
• How did you hear about us: ${formData.get('referralSource')}
• Desired Positions: ${formData.getAll('desiredPositions').join(', ')}
• Available Weekends: ${formData.get('weekendAvailability')}
• Available Weekdays: ${formData.get('weekdayAvailability')}
• Times NOT Available: ${formData.get('unavailableTimes')}

ADDITIONAL INFORMATION:
• Skills/Qualifications: ${formData.get('skills')}
• Felony Convictions: ${formData.get('felonyConvictions')}

REFERENCES:
• Reference 1: ${formData.get('reference1Name')} - ${formData.get('reference1Phone')}
• Reference 2: ${formData.get('reference2Name')} - ${formData.get('reference2Phone')}

EMERGENCY CONTACT:
• Name: ${formData.get('emergencyContactName')}
• Phone: ${formData.get('emergencyContactPhone')}

EMPLOYMENT HISTORY:
${Array.from({length: employerCount}, (_, i) => {
  const num = i + 1;
  return `• Previous Employer ${num}: ${formData.get(`employer${num}Name`)}
  Dates: ${formData.get(`employer${num}StartDate`)} to ${formData.get(`employer${num}EndDate`)}
  Position/Pay: ${formData.get(`employer${num}Position`)} - ${formData.get(`employer${num}Pay`)}
  Reason for Leaving: ${formData.get(`employer${num}Reason`)}`;
}).join('\n\n')}

AGREEMENTS:
• Truthful Information: ${formData.get('truthfulInfo') ? 'Yes' : 'No'}
• Background Investigation: ${formData.get('backgroundCheck') ? 'Yes' : 'No'}
• Company Policies: ${formData.get('companyPolicies') ? 'Yes' : 'No'}
• Photography Consent: ${formData.get('photographyConsent') ? 'Yes' : 'No'}
• Drug Testing: ${formData.get('drugTesting') ? 'Yes' : 'No'}
• Signature: ${formData.get('signature')}

---
Submitted via ZDT's Employment Application Form
    `.trim();

    try {
      const response = await fetch('https://eowj2r2mn07s5m6.m.pipedream.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'info@zdtamusement.com',
          subject: 'New Employment Application Submission',
          message: message,
        }),
      });

      if (response.ok) {
        setSubmitMessage('✅ Your application has been submitted successfully! We will review your application and contact you if there are any suitable positions available.');
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmitMessage('❌ There was an error submitting your application. Please try again or call us at (830) 386-0151.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-10 text-[var(--color-dark)] overflow-hidden min-h-screen" style={{background: 'linear-gradient(135deg, var(--color-brand-red) 0%, var(--color-brand-red-hover) 100%)'}}>
      <AnimatedBackground 
        text="APPLY" 
        textColor="text-red-300" 
        opacity="opacity-10"
      />
      
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black text-center mb-8 drop-shadow-lg text-white">
            Employment Application
          </h1>

          {/* Conditions for Employment */}
          <div className="bg-white/10 rounded-lg p-6 mb-8 drop-shadow-lg">
            <h2 className="text-2xl font-black text-white mb-4">Conditions for Employment:</h2>
            <ul className="text-white text-lg font-bold space-y-2">
              <li>• Must be at least 16 years old</li>
              <li>• Have reliable transportation</li>
              <li>• Be willing to take a drug test</li>
              <li>• Work Spring Break, weekends, and holidays</li>
              <li>• Treat all employees and customers with respect</li>
              <li>• Be on time and friendly</li>
              <li>• No cell phone use while at work</li>
            </ul>
          </div>

          {submitMessage && (
            <div className="bg-white p-4 rounded-lg mb-6 text-center font-bold text-[var(--color-brand-dark)]">
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-xl border-4 border-[var(--color-brand-dark)]">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Date of Application *
                  </label>
                  <input
                    type="date"
                    name="applicationDate"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Screening */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Eligibility Screening
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Age (must be 16+ years old) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="16"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Are you a US citizen or eligible to work in the US? *
                  </label>
                  <select
                    name="workEligible"
                    required
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Do you have a TX driver's license?
                  </label>
                  <select
                    name="driversLicense"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Are you currently in school?
                  </label>
                  <select
                    name="currentlyInSchool"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  Last grade completed
                </label>
                <input
                  type="text"
                  name="lastGradeCompleted"
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>
            </div>

            {/* Employment Preferences */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Employment Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Are you looking for a part-time job?
                  </label>
                  <select
                    name="partTimeInterest"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Desired pay
                  </label>
                  <input
                    type="text"
                    name="desiredPay"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  How did you hear about this job?
                </label>
                <input
                  type="text"
                  name="referralSource"
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  What positions are you interested in? (Check all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="desiredPositions"
                      value="Ride Operator"
                      className="mr-2"
                    />
                    Ride Operator
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="desiredPositions"
                      value="Kitchen"
                      className="mr-2"
                    />
                    Kitchen
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="desiredPositions"
                      value="Maintenance"
                      className="mr-2"
                    />
                    Maintenance
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="desiredPositions"
                      value="Janitorial"
                      className="mr-2"
                    />
                    Janitorial
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Are you available to work weekends?
                  </label>
                  <select
                    name="weekendAvailability"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Are you available to work weekdays?
                  </label>
                  <select
                    name="weekdayAvailability"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  What times are you NOT available to work?
                </label>
                <textarea
                  name="unavailableTimes"
                  rows={3}
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Additional Information
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  List any skills or qualifications that would help you in this job
                </label>
                <textarea
                  name="skills"
                  rows={4}
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  Have you ever been convicted of a felony? If yes, explain:
                </label>
                <textarea
                  name="felonyConvictions"
                  rows={3}
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>
            </div>

            {/* References */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                References (Two adult references, not family members)
              </h3>

              <div className="mb-4">
                <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="reference1Name"
                      className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="reference1Phone"
                      className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">Reference 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="reference2Name"
                      className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="reference2Phone"
                      className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Emergency Contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>
              </div>
            </div>

            {/* Employment History */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Employment History
              </h3>

              {Array.from({length: employerCount}, (_, i) => renderEmployerForm(i + 1))}
              
              <button
                type="button"
                onClick={addEmployer}
                className="mt-4 px-6 py-3 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-bold rounded-lg border-2 border-[var(--color-brand-dark)] shadow-md transition-all"
              >
                + Add Another Previous Employer
              </button>
            </div>

            {/* Agreement Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4 border-b-2 border-[var(--color-brand-dark)] pb-2">
                Agreement and Signature
              </h3>

              <div className="space-y-4 mb-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="truthfulInfo"
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--color-brand-dark)]">
                    I certify that all information provided in this application is true and complete to the best of my knowledge.
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="backgroundCheck"
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--color-brand-dark)]">
                    I understand that this application will be subject to investigation and background check.
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="companyPolicies"
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--color-brand-dark)]">
                    I agree to comply with all company policies and procedures if hired.
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="photographyConsent"
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--color-brand-dark)]">
                    I consent to being photographed or recorded while at work for promotional purposes.
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="drugTesting"
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--color-brand-dark)]">
                    I agree to submit to drug testing as required by company policy.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-brand-dark)] mb-2">
                  Electronic Signature (Type your full name) *
                </label>
                <input
                  type="text"
                  name="signature"
                  required
                  className="w-full p-3 border-2 border-[var(--color-brand-dark)] rounded focus:outline-none focus:border-[var(--color-brand-blue)]"
                  placeholder="Type your full name as your electronic signature"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-xl font-black px-8 py-4 rounded-lg border-4 border-[var(--color-brand-dark)] shadow-xl transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}