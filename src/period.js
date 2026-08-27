function baseSlow(p, recurrenceTime) {
    const interval = 1 / recurrenceTime;
    if (interval < p && p < 1 - interval) {
        return 1;
    }
    if (p >= 1 - interval) {
        const t = (p - 1 + interval) / interval;
        return 0.05 + Math.pow(1 - t, 2) * 1.0;
    }
    const t = p / interval;
    return 0.05 + Math.pow(t, 1 / 2);
}

// intégration composite : trapèze, avec densité accrûe aux extrémités
function integralAdaptive(recurrenceTime, N = 10000) {
    const f = (p) => baseSlow(p, recurrenceTime);
    let total = 0;

    for (let i = 0; i < N; i++) {
        const p0 = i / N;
        const p1 = (i + 1) / N;
        const m = (p0 + p1) / 2;

        const f0 = f(p0);
        const f1 = f(p1);
        const fm = f(m);

        // règle de Simpson approximée : (Δp / 6) * (f0 + 4 fm + f1)
        total += ((p1 - p0) / 6) * (f0 + 4 * fm + f1);
    }

    return total; // c’est l’aire sur [0,1]
}

// Calibration de C
function calibrateC(recurrenceTime) {
    const w = 1 / recurrenceTime
    let I = 1 - 2 * 0.05 + (1 - 2 * w) * 0.05 - 5 / 3 * w + 2 / 3 * Math.pow(w, 3 / 2)
    console.log(I, integralAdaptive(recurrenceTime, 20000));
    return 1 / I;
}

// Test
const rec = 8;
const Ccal = calibrateC(rec);
console.log("C calibrated (adaptive) =", Ccal, Ccal * rec);
