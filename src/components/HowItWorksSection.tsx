import React from 'react';

const STEPS = [
  { number: '1', title: 'Choose Product', description: 'Browse our wide range of printing products.' },
  { number: '2', title: 'Customize', description: 'Upload your design or create one online.' },
  { number: '3', title: 'Confirm & Pay', description: 'Select options and complete payment.' },
  { number: '4', title: 'Print & Deliver', description: 'We print your order and deliver across the UAE.' },
] as const;

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="site-shell how-it-works__inner">
        <h2 id="how-it-works-title" className="how-it-works__title">
          How It <span>Works</span>
        </h2>

        <ol className="how-it-works__grid">
          {STEPS.map((step) => (
            <li className="how-it-works__card" key={step.number}>
              <span className="how-it-works__number" aria-hidden="true">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
