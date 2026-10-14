export type PremiumLamination = 'matt' | 'glossy' | 'velvet';

export interface PremiumFinishSelections {
  spotUv: boolean;
  customDieCut: boolean;
  roundCorner: boolean;
}

interface PremiumMaterialCompatibility {
  allowedLaminations: readonly PremiumLamination[];
  spotUv: boolean;
  hotFoil: boolean;
  roundCorner: boolean;
  customDieCut: boolean;
}

const DEFAULT_COMPATIBILITY: PremiumMaterialCompatibility = {
  allowedLaminations: ['matt', 'glossy', 'velvet'],
  spotUv: true,
  hotFoil: true,
  roundCorner: true,
  customDieCut: true,
};

export const PREMIUM_BUSINESS_CARD_MATERIAL_COMPATIBILITY: Record<string, PremiumMaterialCompatibility> = {
  'premium-pet-760mic': {
    allowedLaminations: ['glossy'],
    spotUv: false,
    hotFoil: true,
    roundCorner: true,
    customDieCut: false,
  },
};

export const getPremiumBusinessCardCompatibility = (stockId: string): PremiumMaterialCompatibility =>
  PREMIUM_BUSINESS_CARD_MATERIAL_COMPATIBILITY[stockId] ?? DEFAULT_COMPATIBILITY;

export const normalizePremiumBusinessCardConfiguration = ({
  stockId,
  lamination,
  finishes,
  foilColor,
}: {
  stockId: string;
  lamination: PremiumLamination;
  finishes: PremiumFinishSelections;
  foilColor: 'none' | 'gold' | 'silver';
}) => {
  const compatibility = getPremiumBusinessCardCompatibility(stockId);

  return {
    compatibility,
    lamination: compatibility.allowedLaminations.includes(lamination)
      ? lamination
      : compatibility.allowedLaminations[0],
    finishes: {
      spotUv: compatibility.spotUv ? finishes.spotUv : false,
      customDieCut: compatibility.customDieCut ? finishes.customDieCut : false,
      roundCorner: compatibility.roundCorner ? finishes.roundCorner : false,
    },
    foilColor: compatibility.hotFoil ? foilColor : 'none' as const,
  };
};
