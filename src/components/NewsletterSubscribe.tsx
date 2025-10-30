import { useState } from 'react';

/**
 * Newsletter Subscription Component
 *
 * Integrates with Beehiv API to capture newsletter subscriptions
 * with UTM tracking and custom field support.
 */

interface NewsletterSubscribeProps {
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  customFields?: Record<string, any>;
  className?: string;
  placeholder?: string;
  buttonText?: string;
}

export default function NewsletterSubscribe({
  utmSource = 'website',
  utmCampaign,
  utmMedium,
  customFields = {},
  className = '',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/beehiv/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          utmSource,
          utmCampaign,
          utmMedium,
          customFields,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Successfully subscribed! Check your email for confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <div className={`newsletter-subscribe ${className}`}>
      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={status === 'loading'}
            className="email-input"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="subscribe-button"
          >
            {status === 'loading' ? 'Subscribing...' : buttonText}
          </button>
        </div>

        {message && (
          <div
            className={`message ${status === 'success' ? 'success' : 'error'}`}
            role="alert"
          >
            {message}
          </div>
        )}
      </form>

      <style jsx>{`
        .newsletter-subscribe {
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }

        .email-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .email-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .email-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .subscribe-button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .subscribe-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .subscribe-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .message.success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #34d399;
        }

        .message.error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #f87171;
        }

        @media (max-width: 640px) {
          .input-group {
            flex-direction: column;
          }

          .subscribe-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
