// src/lib/tariff-calculator.ts

export interface TariffSlabBreakdown {
    slabName: string;
    units: number;
    rate: number;
    amount: number;
}

export interface BillCalculationResult {
    consumerType: 'residential' | 'commercial' | 'industrial';
    totalUnits: number;
    slabs: TariffSlabBreakdown[];
    energyCharge: number;
    demandCharge: number;
    serviceCharge: number;
    subTotal: number;
    vatAmount: number;
    totalAmount: number;
    isLifeline: boolean;
}

/**
 * Calculates electricity bill details according to the standard BERC / WZPDCL tariff system in Bangladesh.
 * 
 * @param units Total consumed units (kWh)
 * @param type Consumer category
 */
export function calculateBangladeshBill(units: number, type: 'residential' | 'commercial' | 'industrial' = 'residential'): BillCalculationResult {
    const totalUnits = Math.max(0, units);
    const slabs: TariffSlabBreakdown[] = [];
    let energyCharge = 0;
    let isLifeline = false;
    let demandCharge = 40;
    let serviceCharge = 40; // Meter rent

    if (type === 'residential') {
        demandCharge = 40;
        serviceCharge = 40;

        // Lifeline check: If total units are 50 or less
        if (totalUnits <= 50 && totalUnits > 0) {
            isLifeline = true;
            const rate = 4.63;
            const amount = totalUnits * rate;
            slabs.push({
                slabName: 'Lifeline (0 - 50 kWh)',
                units: totalUnits,
                rate,
                amount
            });
            energyCharge = amount;
        } else {
            // Standard stepped tariff calculation
            let remaining = totalUnits;

            // Slab 1: 1 - 75 units @ ৳5.26
            if (remaining > 0) {
                const consumedInSlab = Math.min(remaining, 75);
                const rate = 5.26;
                const amount = consumedInSlab * rate;
                slabs.push({
                    slabName: 'Slab 1 (1 - 75 kWh)',
                    units: consumedInSlab,
                    rate,
                    amount
                });
                energyCharge += amount;
                remaining -= consumedInSlab;
            }

            // Slab 2: 76 - 200 units @ ৳7.20
            if (remaining > 0) {
                const consumedInSlab = Math.min(remaining, 125); // 200 - 75 = 125
                const rate = 7.20;
                const amount = consumedInSlab * rate;
                slabs.push({
                    slabName: 'Slab 2 (76 - 200 kWh)',
                    units: consumedInSlab,
                    rate,
                    amount
                });
                energyCharge += amount;
                remaining -= consumedInSlab;
            }

            // Slab 3: 201 - 300 units @ ৳7.59
            if (remaining > 0) {
                const consumedInSlab = Math.min(remaining, 100); // 300 - 200 = 100
                const rate = 7.59;
                const amount = consumedInSlab * rate;
                slabs.push({
                    slabName: 'Slab 3 (201 - 300 kWh)',
                    units: consumedInSlab,
                    rate,
                    amount
                });
                energyCharge += amount;
                remaining -= consumedInSlab;
            }

            // Slab 4: 301 - 400 units @ ৳8.02
            if (remaining > 0) {
                const consumedInSlab = Math.min(remaining, 100); // 400 - 300 = 100
                const rate = 8.02;
                const amount = consumedInSlab * rate;
                slabs.push({
                    slabName: 'Slab 4 (301 - 400 kWh)',
                    units: consumedInSlab,
                    rate,
                    amount
                });
                energyCharge += amount;
                remaining -= consumedInSlab;
            }

            // Slab 5: 401 - 600 units @ ৳11.67
            if (remaining > 0) {
                const consumedInSlab = Math.min(remaining, 200); // 600 - 400 = 200
                const rate = 11.67;
                const amount = consumedInSlab * rate;
                slabs.push({
                    slabName: 'Slab 5 (401 - 600 kWh)',
                    units: consumedInSlab,
                    rate,
                    amount
                });
                energyCharge += amount;
                remaining -= consumedInSlab;
            }

            // Slab 6: Above 600 units @ ৳13.26
            if (remaining > 0) {
                const rate = 13.26;
                const amount = remaining * rate;
                slabs.push({
                    slabName: 'Slab 6 (Above 600 kWh)',
                    units: remaining,
                    rate,
                    amount
                });
                energyCharge += amount;
            }
        }
    } else if (type === 'commercial') {
        demandCharge = 80;
        serviceCharge = 60;
        const rate = 13.00;
        const amount = totalUnits * rate;
        slabs.push({
            slabName: 'Flat Commercial Rate',
            units: totalUnits,
            rate,
            amount
        });
        energyCharge = amount;
    } else if (type === 'industrial') {
        demandCharge = 150;
        serviceCharge = 100;
        const rate = 10.50;
        const amount = totalUnits * rate;
        slabs.push({
            slabName: 'Flat Industrial Rate',
            units: totalUnits,
            rate,
            amount
        });
        energyCharge = amount;
    }

    const subTotal = energyCharge + demandCharge + serviceCharge;
    const vatAmount = subTotal * 0.05; // 5% VAT in Bangladesh
    const totalAmount = subTotal + vatAmount;

    return {
        consumerType: type,
        totalUnits,
        slabs,
        energyCharge: Math.round(energyCharge * 100) / 100,
        demandCharge,
        serviceCharge,
        subTotal: Math.round(subTotal * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        isLifeline
    };
}
