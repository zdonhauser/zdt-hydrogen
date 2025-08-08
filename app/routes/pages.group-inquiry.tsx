import { type MetaFunction, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Form, useNavigation, useActionData } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { checkForSpam, getClientIP } from '~/lib/spam-protection';

export const meta: MetaFunction = () => {
  return [{ title: 'Group Inquiry - ZDT\'s Amusement Park' }];
};

export default function GroupInquiryPage() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<{type: 'success' | 'error' | null; message: string}>({type: null, message: ''});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const actionData = useActionData<{success: boolean; error?: string}>();
  const formLoadTime = useRef(Date.now());

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setStatus({
          type: 'success',
          message: 'Your group inquiry has been submitted successfully! We\'ll get back to you soon with more information.'
        });
        setHasSubmitted(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus({
          type: 'error',
          message: actionData.error || 'There was an error submitting your inquiry. Please try again.'
        });
        setHasSubmitted(false); // Allow retry on error
      }
    }
  }, [actionData]);

  useEffect(() => {
    return () => setStatus({type: null, message: ''});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-brand-green)] to-[var(--color-light)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--color-dark)] mb-2">
            Group Inquiry
          </h1>
          <p className="text-lg text-[var(--color-brand-dark)] mb-4">
            Planning a group visit? Fill out this form and we'll get back to you with rates and availability.
          </p>
          <p className="text-sm text-[var(--color-brand-dark)] font-semibold">
            Please note that these rates are only available for the listed group types.
          </p>
        </header>
        
        <div className="bg-[var(--color-light)] p-6 md:p-8 rounded-xl shadow-2xl border-4 border-[var(--color-brand-dark)]">
          {status.type && (
            <div className={`p-4 mb-6 rounded-lg font-bold text-center ${status.type === 'success' ? 'bg-green-100 text-green-800 border-4 border-green-600' : 'bg-red-100 text-red-800 border-4 border-red-600'}`}>
              {status.message}
              {hasSubmitted && (
                <button
                  onClick={() => {
                    setHasSubmitted(false);
                    setStatus({type: null, message: ''});
                  }}
                  className="block mx-auto mt-4 px-6 py-2 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-bold rounded-lg transition-all"
                >
                  Submit Another Inquiry
                </button>
              )}
            </div>
          )}
          
          {!hasSubmitted && (
          <Form method="post" className="space-y-6" replace>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Name of Organization or Group <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="groupType" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Type of Group <span className="text-red-500">*</span>
                </label>
                <select
                  id="groupType"
                  name="groupType"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                >
                  <option value="">Select a group type</option>
                  <option value="School">School</option>
                  <option value="Camp or Daycare">Camp or Daycare</option>
                  <option value="Scouts">Scouts</option>
                  <option value="Sports Team">Sports Team</option>
                  <option value="Non-Profit">Non-Profit</option>
                </select>
              </div>

              <div>
                <label htmlFor="taxExempt" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Tax Exempt Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="taxExempt"
                  name="taxExempt"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="groupSize" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Group Size <span className="text-red-500">*</span>
              </label>
              <select
                id="groupSize"
                name="groupSize"
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
              >
                <option value="">Select group size</option>
                <option value="15-30 Participants">15-30 Participants</option>
                <option value="30-50 Participants">30-50 Participants</option>
                <option value="50-100 Participants">50-100 Participants</option>
                <option value="100-250 Participants">100-250 Participants</option>
                <option value="250-500 Participants">250-500 Participants</option>
                <option value="500+ Participants">500+ Participants</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="potentialDate" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Potential Date
                </label>
                <input
                  type="date"
                  id="potentialDate"
                  name="potentialDate"
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="preferredStartTime" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Preferred Start Time
                </label>
                <input
                  type="time"
                  id="preferredStartTime"
                  name="preferredStartTime"
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lengthOfStay" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Potential Length of Stay <span className="text-red-500">*</span>
              </label>
              <select
                id="lengthOfStay"
                name="lengthOfStay"
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
              >
                <option value="">Select length of stay</option>
                <option value="3 Hours">3 Hours</option>
                <option value="4 Hours">4 Hours</option>
                <option value="5 Hours">5 Hours</option>
                <option value="All Day">All Day</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pizzaDrinks" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Pizza and Drinks Add-on ($7/Person) <span className="text-red-500">*</span>
                </label>
                <select
                  id="pizzaDrinks"
                  name="pizzaDrinks"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="partyRoom" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Party Room Reservation ($2/Person) <span className="text-red-500">*</span>
                </label>
                <select
                  id="partyRoom"
                  name="partyRoom"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                >
                  <option value="">Select option</option>
                  <option value="No">No</option>
                  <option value="Yes, Midway Point (minimum 50 participants)">Yes, Midway Point (minimum 50 participants)</option>
                  <option value="Yes, Turning Point (minimum 100 participants)">Yes, Turning Point (minimum 100 participants)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="preferredContact" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Preferred Contact Method <span className="text-red-500">*</span>
              </label>
              <select
                id="preferredContact"
                name="preferredContact"
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
              >
                <option value="">Select contact method</option>
                <option value="E-Mail">E-Mail</option>
                <option value="Phone">Phone</option>
                <option value="Either">Either</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="additionalQuestions" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Additional Questions
              </label>
              <textarea
                id="additionalQuestions"
                name="additionalQuestions"
                rows={4}
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent"
                placeholder="Any additional questions or special requirements..."
              ></textarea>
            </div>

            <input type="hidden" name="formName" value="Group Inquiry" />
            <input type="hidden" name="submission_time" value={formLoadTime.current} />
            
            {/* Honeypot field - hidden from real users */}
            <div style={{position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, pointerEvents: 'none'}}>
              <label htmlFor="url" aria-hidden="true" tabIndex={-1}>
                URL
              </label>
              <input
                type="text"
                id="url"
                name="url"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={navigation.state === 'submitting' || hasSubmitted}
                className={`w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-green)] ${(navigation.state === 'submitting' || hasSubmitted) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {navigation.state === 'submitting' ? 'Submitting...' : hasSubmitted ? 'Inquiry Submitted' : 'Submit Group Inquiry'}
              </button>
            </div>
          </Form>
          )}
          
          {!hasSubmitted && (
          <div className="mt-8 pt-6 border-t-2 border-[var(--color-brand-green)]">
            <div className="bg-[var(--color-brand-yellow)] p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">Need to speak with someone right away?</h3>
              <p className="text-[var(--color-brand-dark)]">
                Call our group sales line at <strong>(830) 217-3565</strong>
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  
  // Check for spam
  const clientIP = getClientIP(request);
  const spamCheck = checkForSpam(formData, clientIP);
  
  if (spamCheck.isSpam) {
    console.warn(`Spam detected in group inquiry: ${spamCheck.reason}`);
    // Return success to avoid letting spammers know they were caught
    return { success: true };
  }
  
  // Collect all form data
  const contactName = formData.get('contactName');
  const organizationName = formData.get('organizationName');
  const groupType = formData.get('groupType');
  const taxExempt = formData.get('taxExempt');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const groupSize = formData.get('groupSize');
  const potentialDate = formData.get('potentialDate');
  const preferredStartTime = formData.get('preferredStartTime');
  const lengthOfStay = formData.get('lengthOfStay');
  const pizzaDrinks = formData.get('pizzaDrinks');
  const partyRoom = formData.get('partyRoom');
  const preferredContact = formData.get('preferredContact');
  const additionalQuestions = formData.get('additionalQuestions');
  const formName = formData.get('formName');

  // Build comprehensive message from all form fields
  const message = `
GROUP INQUIRY DETAILS:

Contact Information:
- Contact Name: ${contactName}
- Organization/Group: ${organizationName}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Group Details:
- Type of Group: ${groupType}
- Tax Exempt Status: ${taxExempt}
- Group Size: ${groupSize}

Visit Details:
- Potential Date: ${potentialDate || 'Not specified'}
- Preferred Start Time: ${preferredStartTime || 'Not specified'}
- Length of Stay: ${lengthOfStay}

Add-ons:
- Pizza and Drinks ($7/person): ${pizzaDrinks}
- Party Room ($2/person): ${partyRoom}

Communication:
- Preferred Contact Method: ${preferredContact}

Additional Questions:
${additionalQuestions || 'None'}
  `.trim();

  const payload = {
    name: contactName,
    email,
    subject: formName,
    message,
    formName,
  };

  try {
    const response = await fetch('https://eon2vfigqmpnne.m.pipedream.net', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending to Pipedream:', error);
    return { 
      success: false, 
      error: 'Failed to send inquiry. Please try again later.' 
    };
  }
}