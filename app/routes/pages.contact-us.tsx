import { type MetaFunction, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Form, useNavigation, useActionData } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { checkForSpam, getClientIP } from '~/lib/spam-protection';
import { performSecurityCheck, escapeHtml } from '~/lib/security-utils';

export const meta: MetaFunction = () => {
  return [{ title: 'Contact Us' }]  ;
};  

export default function ContactPage() {
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
          message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        });
        setHasSubmitted(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus({
          type: 'error',
          message: actionData.error || 'There was an error sending your message. Please try again.'
        });
        setHasSubmitted(false); // Allow retry on error
      }
    }
  }, [actionData]);

  // Clear status when form is reset or when navigating away
  useEffect(() => {
    return () => setStatus({type: null, message: ''});
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-brand-blue)] to-[var(--color-light)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--color-dark)] mb-2">
            Contact Us
          </h1>
          <p className="text-lg text-[var(--color-brand-dark)]">
            We&apos;d love to hear from you! Send us a message and we&apos;ll get back to you as soon as possible.
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
                  className="block mx-auto mt-4 px-6 py-2 bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-bold rounded-lg transition-all"
                >
                  Send Another Message
                </button>
              )}
            </div>
          )}
          {!hasSubmitted && (
          <Form method="post" className="space-y-6" replace>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[var(--color-dark)] mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-2 border-2 border-[var(--color-brand-dark)] rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
              ></textarea>
            </div>

            <input type="hidden" name="formName" value="Contact Us" />
            <input type="hidden" name="submission_time" value={formLoadTime.current} />
            
            {/* Honeypot field - hidden from real users */}
            <div style={{position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, pointerEvents: 'none'}}>
              <label htmlFor="website" aria-hidden="true" tabIndex={-1}>
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={navigation.state === 'submitting' || hasSubmitted}
                className={`w-full bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-blue)] ${(navigation.state === 'submitting' || hasSubmitted) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {navigation.state === 'submitting' ? 'Sending...' : hasSubmitted ? 'Message Sent' : 'Send Message'}
              </button>
            </div>
          </Form>
          )}
          
          {!hasSubmitted && (
          <div className="mt-12 pt-8 border-t-2 border-[var(--color-brand-blue)]">
            <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-4">Visit Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--color-dark)]">Address</h4>
                <p className="text-[var(--color-dark)]">
                  1218 N Camp St<br />
                  Seguin, TX 78155
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-dark)]">Contact Info</h4>
                <p className="text-[var(--color-dark)]">
                  Phone: (830) 386-0151
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// This would be the action that handles form submission
export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  
  // Check for spam
  const clientIP = getClientIP(request);
  const spamCheck = checkForSpam(formData, clientIP);
  
  if (spamCheck.isSpam) {
    console.warn(`Spam detected: ${spamCheck.reason}`);
    // Return success to avoid letting spammers know they were caught
    return { success: true };
  }
  
  // Perform security validation and sanitization
  const securityCheck = performSecurityCheck(formData, ['name', 'email', 'message']);
  
  if (!securityCheck.isValid) {
    console.warn('Security validation failed:', securityCheck.errors);
    return { 
      success: false, 
      error: 'Invalid input detected. Please check your submission.' 
    };
  }
  
  // Use sanitized data
  const { name, email, subject, message } = securityCheck.sanitizedData;
  const formName = escapeHtml(String(formData.get('formName') || ''));

  // Additional validation for required fields
  if (!name || !email || !message) {
    return { 
      success: false, 
      error: 'Please fill in all required fields.' 
    };
  }
  
  const payload = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject || ''),
    message: escapeHtml(message),
    formName: formName,
  };

  try {
    // TODO: Replace the URL below with your actual Pipedream webhook URL
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
      error: 'Failed to send message. Please try again later.' 
    };
  }
}
