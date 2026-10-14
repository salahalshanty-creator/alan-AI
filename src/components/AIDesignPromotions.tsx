import React from 'react';
import { ArrowRight } from 'lucide-react';
import aiDesignImage from '../assets/images/product_luxury_business_cards_1790497087122.jpg';
import customGiftsImage from '../assets/images/product_bespoke_rigid_boxes_1790497098587.jpg';

interface AIDesignPromotionsProps {
  onExploreGifts: () => void;
  onStartDesigning?: () => void;
}

export const AIDesignPromotions: React.FC<AIDesignPromotionsProps> = ({ onExploreGifts, onStartDesigning }) => {
  return (
    <section id="design-promotions" className="design-promos" aria-label="Design and custom gift services">
      <div className="site-shell design-promos__inner">
        <article className="design-promo-card">
          <img className="design-promo-card__image" src={aiDesignImage} alt="" aria-hidden="true" />
          <div className="design-promo-card__content">
            <p className="design-promo-card__label">AI Design Studio</p>
            <h2>Design Your Way</h2>
            <p>Create and customize professional print designs with AI-powered tools.</p>
            <button className="design-promo-card__cta" type="button" onClick={onStartDesigning}>
              Start Designing <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </article>

        <article className="design-promo-card">
          <img className="design-promo-card__image" src={customGiftsImage} alt="" aria-hidden="true" />
          <div className="design-promo-card__content">
            <p className="design-promo-card__label">Custom Printing</p>
            <h2>Custom Gifts<br />for Every Occasion</h2>
            <p>Make your business stand out with premium branded gifts.</p>
            <button className="design-promo-card__cta" type="button" onClick={onExploreGifts}>
              Explore Gifts <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
