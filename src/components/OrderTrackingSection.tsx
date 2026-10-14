import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Circle, LoaderCircle, RotateCcw, Search } from 'lucide-react';
import {
  lookupDemoOrder,
  TRACKING_STAGES,
  TrackingOrder,
} from '../data/orderTrackingMock';

type LookupState = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

export const OrderTrackingSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStageIndex = useMemo(
    () => order ? TRACKING_STAGES.findIndex((stage) => stage.value === order.status) : -1,
    [order],
  );
  const currentStage = currentStageIndex >= 0 ? TRACKING_STAGES[currentStageIndex] : null;
  const progress = currentStageIndex >= 0
    ? Math.round(((currentStageIndex + 1) / TRACKING_STAGES.length) * 100)
    : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = query.trim().toUpperCase();

    if (!normalizedQuery) {
      setValidationMessage('Please enter your order number.');
      setLookupState('idle');
      setOrder(null);
      return;
    }

    setValidationMessage('');
    setLookupState('loading');
    setOrder(null);

    try {
      const result = await lookupDemoOrder(normalizedQuery);
      if (!result) {
        setLookupState('not-found');
        return;
      }
      setOrder(result);
      setLookupState('success');
    } catch {
      setLookupState('error');
    }
  };

  const tryAgain = () => {
    setQuery('');
    setOrder(null);
    setValidationMessage('');
    setLookupState('idle');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section className="order-tracking" aria-labelledby="order-tracking-title">
      <div className="site-shell order-tracking__inner">
        <div className="order-tracking__lookup">
          <p className="order-tracking__eyebrow">Track Your Order</p>
          <h2 id="order-tracking-title">Know Where Your <span>Order Is.</span></h2>
          <p className="order-tracking__intro">
            Enter your order number to see its current production and delivery status.
          </p>

          <form className="order-tracking__form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="homepage-order-number">Order number</label>
            <div className="order-tracking__field">
              <Search aria-hidden="true" />
              <input
                ref={inputRef}
                id="homepage-order-number"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (validationMessage) setValidationMessage('');
                }}
                placeholder="Enter your order number"
                autoComplete="off"
                aria-describedby={validationMessage ? 'order-number-error' : 'tracking-demo-note'}
                aria-invalid={Boolean(validationMessage)}
              />
              <button type="submit" disabled={lookupState === 'loading'}>
                Track Order <ArrowRight aria-hidden="true" />
              </button>
            </div>
            {validationMessage && <p id="order-number-error" className="order-tracking__validation">{validationMessage}</p>}
          </form>

          <div id="tracking-demo-note" className="order-tracking__demo-note">
            <strong>Demo preview</strong>
            <span>Try ALAN-2026-001, ALAN-2026-002, or ALAN-2026-003.</span>
          </div>
        </div>

        <div className="order-tracking__result" aria-live="polite" aria-busy={lookupState === 'loading'}>
          {lookupState === 'idle' && (
            <div className="order-tracking__empty-state">
              <span><Search aria-hidden="true" /></span>
              <h3>Your order journey, at a glance</h3>
              <p>Enter a demo order number to view production milestones and delivery progress.</p>
            </div>
          )}

          {lookupState === 'loading' && (
            <div className="order-tracking__empty-state">
              <span><LoaderCircle className="order-tracking__loader" aria-hidden="true" /></span>
              <h3>Checking your order...</h3>
              <p>Looking up the latest demo tracking information.</p>
            </div>
          )}

          {(lookupState === 'not-found' || lookupState === 'error') && (
            <div className="order-tracking__empty-state order-tracking__empty-state--error">
              <span><Circle aria-hidden="true" /></span>
              <h3>{lookupState === 'not-found' ? 'Order not found' : 'Unable to check this order'}</h3>
              <p>{lookupState === 'not-found'
                ? "We couldn't find an order matching this number. Please check the order number and try again."
                : 'Something went wrong while checking the order. Please try again.'}</p>
              <button type="button" onClick={tryAgain}><RotateCcw aria-hidden="true" /> Try Again</button>
            </div>
          )}

          {lookupState === 'success' && order && currentStage && (
            <div className="order-tracking__success">
              <header className="order-tracking__result-header">
                <div><span>Order</span><strong>{order.orderNumber}</strong></div>
                <div><span>Current Status</span><strong>{currentStage.label}</strong></div>
              </header>

              <div className="order-tracking__status-card">
                <span>Current Status</span>
                <h3>{currentStage.label}</h3>
                <p>{currentStage.description}</p>
              </div>

              <div className="order-tracking__progress">
                <div><span>Order Progress</span><strong>{progress}%</strong></div>
                <div className="order-tracking__progress-track" role="progressbar" aria-label="Order progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              <ol className="order-tracking__timeline" aria-label="Order status timeline">
                {TRACKING_STAGES.map((stage, index) => {
                  const stageState = index < currentStageIndex ? 'complete' : index === currentStageIndex ? 'current' : 'upcoming';
                  return (
                    <li className={`is-${stageState}`} key={stage.value}>
                      <span className="order-tracking__marker" aria-hidden="true">
                        {stageState === 'complete' ? <Check /> : <Circle />}
                      </span>
                      <span>{stage.label}</span>
                      <span className="sr-only">{stageState === 'complete' ? 'Completed' : stageState === 'current' ? 'Current stage' : 'Upcoming'}</span>
                    </li>
                  );
                })}
              </ol>

              <dl className="order-tracking__details">
                <div><dt>Order Number</dt><dd>{order.orderNumber}</dd></div>
                <div><dt>Current Stage</dt><dd>{currentStage.label}</dd></div>
                <div><dt>Estimated Delivery</dt><dd>{order.estimatedDelivery}</dd></div>
                <div><dt>Last Updated</dt><dd>{order.updatedAt}</dd></div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
