import { type MetaFunction, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Form, useNavigation, useActionData } from 'react-router';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Private Event Inquiry - ZDT\'s Amusement Park' }];
};

export default function PrivateEventInquiryPage() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<{type: 'success' | 'error' | null; message: string}>({type: null, message: ''});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const actionData = useActionData<{success: boolean; error?: string}>();

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setStatus({
          type: 'success',
          message: 'Your private event inquiry has been submitted successfully! We\'ll get back to you soon with more information.'
        });
        setHasSubmitted(true);
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
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-brand-yellow)] to-[var(--color-light)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--color-dark)] mb-2">
            Private Event Inquiry
          </h1>
          <p className="text-lg text-[var(--color-brand-dark)] mb-4">
            Planning a private event for 100-2000 people? We can help you create an unforgettable experience!
          </p>
          <p className="text-sm text-[var(--color-brand-dark)] font-semibold">
            Private events can be scheduled when the park is not already open, or you can rent the entire park.
          </p>
        </header>
        
        <div className="bg-[var(--color-light)] p-6 md:p-8 rounded-xl shadow-2xl border-4 border-[var(--color-brand-dark)]">
          {status.type && (
            <div className={`p-4 mb-6 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status.message}
            </div>
          )}
          
          <div className="mb-6 p-4 bg-[var(--color-brand-yellow)] border-2 border-[var(--color-brand-dark)] rounded-lg">
            <p className="text-sm text-[var(--color-brand-dark)] font-semibold">
              <strong>Note:</strong> Private events must pay for at least 100 people to book.
            </p>
          </div>

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
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Name of Organization or Group
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
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
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="attendeeCount" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Estimated Number of Attendees <span className="text-red-500">*</span>
              </label>
              <select
                id="attendeeCount"
                name="attendeeCount"
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
              >
                <option value="">Select attendee count</option>
                <option value="Less than 100 People">Less than 100 People</option>
                <option value="100 - 175 People">100 - 175 People</option>
                <option value="175 - 250 People">175 - 250 People</option>
                <option value="250 - 500 People">250 - 500 People</option>
                <option value="500 - 750 People">500 - 750 People</option>
                <option value="750 - 2000 People">750 - 2000 People</option>
                <option value="More Than 2000 People">More Than 2000 People</option>
              </select>
            </div>

            <div>
              <label htmlFor="potentialDate" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Potential Date
              </label>
              <input
                type="date"
                id="potentialDate"
                name="potentialDate"
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                id="lockIn"
                name="lockIn"
                type="checkbox"
                value="Yes"
                className="h-4 w-4 text-[var(--color-brand-yellow)] focus:ring-[var(--color-brand-yellow)] border-gray-300 rounded"
              />
              <label htmlFor="lockIn" className="ml-2 block text-sm text-gray-900">
                Would this event be a lock-in? <span className="text-gray-600">(Check here if you would like to request lock-in info)</span>
              </label>
            </div>
            
            <div>
              <label htmlFor="questionsRequests" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Do you have any questions or special requests?
              </label>
              <textarea
                id="questionsRequests"
                name="questionsRequests"
                rows={4}
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
                placeholder="Please provide any additional details about your event, questions, or special requests..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="contactPreference" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Contact Preference <span className="text-red-500">*</span>
              </label>
              <select
                id="contactPreference"
                name="contactPreference"
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-yellow)] focus:border-transparent"
              >
                <option value="">Select contact preference</option>
                <option value="E-Mail">E-Mail</option>
                <option value="Phone">Phone</option>
                <option value="Either">Either</option>
              </select>
            </div>

            <input type="hidden" name="formName" value="Private Event Inquiry" />
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={navigation.state === 'submitting' || hasSubmitted}
                className={`w-full bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-yellow)] border-2 border-[var(--color-brand-dark)] ${(navigation.state === 'submitting' || hasSubmitted) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {navigation.state === 'submitting' ? 'Submitting...' : hasSubmitted ? 'Inquiry Submitted' : 'Submit Private Event Inquiry'}
              </button>
            </div>
          </Form>
          
          <div className="mt-8 pt-6 border-t-2 border-[var(--color-brand-yellow)]">
            <div className="bg-[var(--color-brand-green)] p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Ready to start planning?</h3>
              <p className="text-white">
                Call us at <strong>(830) 217-3565</strong> to discuss your private event needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  
  // Collect all form data
  const contactName = formData.get('contactName');
  const organizationName = formData.get('organizationName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const attendeeCount = formData.get('attendeeCount');
  const potentialDate = formData.get('potentialDate');
  const lockIn = formData.get('lockIn');
  const questionsRequests = formData.get('questionsRequests');
  const contactPreference = formData.get('contactPreference');
  const formName = formData.get('formName');

  // Build comprehensive message from all form fields
  const message = `
PRIVATE EVENT INQUIRY DETAILS:

Contact Information:
- Contact Name: ${contactName}
- Organization/Group: ${organizationName || 'Not provided'}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Event Details:
- Estimated Number of Attendees: ${attendeeCount}
- Potential Date: ${potentialDate || 'Not specified'}
- Lock-in Event: ${lockIn ? 'Yes' : 'No'}

Questions/Special Requests:
${questionsRequests || 'None provided'}

Communication:
- Contact Preference: ${contactPreference}
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