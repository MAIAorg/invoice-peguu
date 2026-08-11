"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numeroALetras = numeroALetras;
function numeroALetras(amount, moneda = 'PESOS') {
    const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const ESPECIALES = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
        'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const DECENAS = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
        'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
        'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
    const toWords = (n) => {
        if (n === 0)
            return 'CERO';
        let r = '';
        if (n >= 1000000) {
            const m = Math.floor(n / 1000000);
            r += (m === 1) ? 'UN MILLÓN ' : toWords(m) + ' MILLONES ';
            n %= 1000000;
        }
        if (n >= 1000) {
            const k = Math.floor(n / 1000);
            r += (k === 1) ? 'MIL ' : toWords(k) + ' MIL ';
            n %= 1000;
        }
        if (n >= 100) {
            if (n === 100)
                r += 'CIEN ';
            else
                r += CENTENAS[Math.floor(n / 100)] + ' ';
            n %= 100;
        }
        if (n >= 20) {
            r += DECENAS[Math.floor(n / 10)];
            if (n % 10 > 0)
                r += ' Y ' + UNIDADES[n % 10];
            r += ' ';
        }
        else if (n >= 10) {
            r += ESPECIALES[n - 10] + ' ';
        }
        else if (n > 0) {
            r += UNIDADES[n] + ' ';
        }
        return r.trim();
    };
    const parts = Math.abs(amount).toFixed(2).split('.');
    const entero = parseInt(parts[0]);
    const centavos = parts[1];
    const palabras = (entero === 0) ? 'CERO' : toWords(entero);
    const currencyName = moneda.toUpperCase() === 'USD' ? 'DOLARES' : 'PESOS';
    const suffix = moneda.toUpperCase() === 'USD' ? 'USD' : 'M.N.';
    return `(${palabras} ${currencyName} ${centavos}/100 ${suffix})`;
}
//# sourceMappingURL=numero-a-letras.util.js.map