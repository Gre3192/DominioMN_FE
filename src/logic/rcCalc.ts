export interface RCSection {
  width: number; // mm
  height: number; // mm
  concreteClass: string;
  steelClass: string;
  fck: number; // MPa (N/mm2)
  fyk: number; // MPa
  gammaC: number;
  gammaS: number;
  alphaCC: number;
  topBars: number; // count
  topBarDiam: number; // mm
  bottomBars: number; // count
  bottomBarDiam: number; // mm
  sideBars: number; // count
  sideBarDiam: number; // mm
  cover: number; // mm (to center of bar)
}

export interface PointMN {
  N: number; // kN
  M: number; // kNm
  xu?: number; // mm, neutral axis
  epsC?: number; 
  epsS1?: number;
  epsS2?: number;
  label?: string;
}

export const CONCRETE_CLASSES = [
  { name: 'C12/15', fck: 12 },
  { name: 'C16/20', fck: 16 },
  { name: 'C20/25', fck: 20 },
  { name: 'C25/30', fck: 25 },
  { name: 'C28/35', fck: 28 },
  { name: 'C30/37', fck: 30 },
  { name: 'C32/40', fck: 32 },
  { name: 'C35/45', fck: 35 },
  { name: 'C40/50', fck: 40 },
  { name: 'C45/55', fck: 45 },
  { name: 'C50/60', fck: 50 },
];

export const STEEL_CLASSES = [
  { name: 'B450C', fyk: 450 },
  { name: 'B450A', fyk: 450 },
];

/**
 * Parabola-Rectangle stress-strain for concrete (NTC2018 / EC2)
 */
export function concreteStress(eps: number, fcd: number): number {
  const epsc2 = 0.002;
  const epscu2 = 0.0035;
  const n = 2.0;

  if (eps <= 0) return 0;
  if (eps <= epsc2) {
    return fcd * (1 - Math.pow(1 - eps / epsc2, n));
  }
  if (eps <= epscu2) {
    return fcd;
  }
  return 0;
}

/**
 * Elastic-perfectly plastic stress-strain for steel
 */
export function steelStress(eps: number, fyd: number): number {
  const Es = 200000; // MPa
  const epsY = fyd / Es;
  const absEps = Math.abs(eps);
  
  const stress = Math.min(absEps * Es, fyd);
  return eps >= 0 ? stress : -stress;
}

export function calculateMN(section: RCSection, epsTop: number, epsBottom: number): PointMN {
  const { width, height, cover } = section;
  const fcd = (section.alphaCC * section.fck) / section.gammaC;
  const fyd = section.fyk / section.gammaS;

  const steps = 100;
  const dy = height / steps;
  let Nc = 0;
  let Mc = 0;

  // Integrate concrete
  for (let i = 0; i < steps; i++) {
    const y = (i + 0.5) * dy; // Distance from top
    const epsY = epsTop + (epsBottom - epsTop) * (y / height);
    const sigmaC = concreteStress(epsY, fcd);
    const force = sigmaC * width * dy;
    Nc += force;
    Mc += force * (height / 2 - y); // Moment about centroid
  }

  // Steel
  const topAs = section.topBars * Math.PI * Math.pow(section.topBarDiam / 2, 2);
  const botAs = section.bottomBars * Math.PI * Math.pow(section.bottomBarDiam / 2, 2);
  
  const d_top = cover;
  const d_bot = height - cover;

  const epsTopS = epsTop + (epsBottom - epsTop) * (d_top / height);
  const epsBotS = epsTop + (epsBottom - epsTop) * (d_bot / height);

  const sigmaTopS = steelStress(epsTopS, fyd);
  const sigmaBotS = steelStress(epsBotS, fyd);

  const Ns = (sigmaTopS * topAs) + (sigmaBotS * botAs);
  const Ms = (sigmaTopS * topAs * (height / 2 - d_top)) + (sigmaBotS * botAs * (height / 2 - d_bot));

  // Side bars
  let Nside = 0;
  let Mside = 0;
  if (section.sideBars > 0) {
    const sideAs = Math.PI * Math.pow(section.sideBarDiam / 2, 2);
    for (let i = 1; i <= section.sideBars; i++) {
        const y = cover + (height - 2 * cover) * (i / (section.sideBars + 1));
        const epsS = epsTop + (epsBottom - epsTop) * (y / height);
        const sigmaS = steelStress(epsS, fyd);
        Nside += sigmaS * sideAs;
        Mside += sigmaS * sideAs * (height / 2 - y);
    }
  }

  return {
    N: (Nc + Ns + Nside) / 1000, // kN
    M: (Mc + Ms + Mside) / 1000000, // kNm
    epsC: epsTop,
    epsS1: epsBotS
  };
}

export function generateInteractionDiagram(section: RCSection): PointMN[] {
  const points: PointMN[] = [];
  const epscu2 = 0.0035;
  const epsc2 = 0.002;
  const epsyk = 0.01; // Tension limit

  // Region 1: Pure tension to Decompression
  for (let eps = epsyk; eps >= 0; eps -= 0.001) {
    points.push(calculateMN(section, eps, epsyk));
  }

  // Region 2: From Decompression to Pivot A (bottom yielding)
  for (let xByH = 0.1; xByH <= 1.0; xByH += 0.05) {
      const xu = xByH * (section.height - section.cover);
      const epsTop = epsyk * xu / (section.height - section.cover - xu);
       // This is more complex, let's use a simpler pivot approach
  }

  // Simplified robust iteration:
  // We sweep the neutral axis position from -H to 2H
  // and keep eps within limits
  
  const sweep = [];

  // Pivot A: eps_s = 0.01 (Tension limit)
  for (let xu = -section.height * 2; xu <= section.height - section.cover; xu += 10) {
      // eps_s = 0.01 at d_bot
      const d = section.height - section.cover;
      const epsTop = (0.01 * xu) / (d - xu);
      if (epsTop <= epscu2) sweep.push(calculateMN(section, epsTop, 0.01));
  }

  // Pivot B: eps_c = 0.0035 (Compression limit)
  for (let xu = section.height - section.cover; xu <= section.height * 5; xu += 20) {
      const epsBot = 0.0035 * (xu - (section.height - section.cover)) / xu;
      sweep.push(calculateMN(section, epscu2, -epsBot));
  }
  
  // Pure Compression Pivot C: eps_c = 0.002 at 3/7 H
  // For simplicity, we just add the pure compression point
  sweep.push(calculateMN(section, 0.002, 0.002));

  // Also add pure tension
  sweep.push(calculateMN(section, -0.01, -0.01));

  // Symmetric part (simply copy and flip M if section is symmetric, 
  // but better to just calculate for negative M if needed, 
  // though usually we just show positive M)
  
  return sweep.sort((a, b) => a.N - b.N);
}
