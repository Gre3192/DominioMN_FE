export const COEFF_COMBINAZIONE = {
    NTC18: {
        CAT_A: { psi_0j: 0.7, psi_1j: 0.5, psi_2j: 0.3 },
        CAT_B: { psi_0j: 0.7, psi_1j: 0.5, psi_2j: 0.3 },
        CAT_C: { psi_0j: 0.7, psi_1j: 0.7, psi_2j: 0.6 },
        CAT_D: { psi_0j: 0.7, psi_1j: 0.7, psi_2j: 0.6 },
        CAT_E: { psi_0j: 1.0, psi_1j: 0.9, psi_2j: 0.8 },
        CAT_F: { psi_0j: 0.7, psi_1j: 0.7, psi_2j: 0.6 },
        CAT_G: { psi_0j: 0.7, psi_1j: 0.5, psi_2j: 0.3 },
        CAT_H: { psi_0j: 0.0, psi_1j: 0.0, psi_2j: 0.0 },
        CAT_I: { psi_0j: null, psi_1j: null, psi_2j: null },
        CAT_K: { psi_0j: null, psi_1j: null, psi_2j: null },
        wind: { psi_0j: 0.6, psi_1j: 0.2, psi_2j: 0.0 },
        snow_under1000: { psi_0j: 0.5, psi_1j: 0.2, psi_2j: 0.0 },
        snow_over1000: { psi_0j: 0.7, psi_1j: 0.5, psi_2j: 0.2 },
        thermalVariation: { psi_0j: 0.6, psi_1j: 0.5, psi_2j: 0.0 },
    }
}

export const COEFF_SLU = {
    NTC18: {
        gammaG1: {
            favorable: {
                EQU: 0.9,
                A1: 1.0,
                A2: 1.0,
            },
            unfavorable: {
                EQU: 1.1,
                A1: 1.3,
                A2: 1.0,
            },
        },
        gammaG2: {
            favorable: {
                EQU: 0.8,
                A1: 0.8,
                A2: 0.8,
            },
            unfavorable: {
                EQU: 1.5,
                A1: 1.5,
                A2: 1.3,
            },
        },
        gammaQi: {
            favorable: {
                EQU: 0.0,
                A1: 0.0,
                A2: 0.0,
            },
            unfavorable: {
                EQU: 1.5,
                A1: 1.5,
                A2: 1.3,
            },
        },
    }
}

