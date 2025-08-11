/**
 * Fonction qui fait la somme de deux nombres
 * @param {number} a - Premier nombre
 * @param {number} b - Deuxième nombre
 * @returns {number} La somme de a et b
 */
function somme(a, b) {
    return a + b;
}

/**
 * Fonction qui fait la somme d'un tableau de nombres
 * @param {number[]} nombres - Tableau de nombres
 * @returns {number} La somme de tous les nombres
 */
function sommeTableau(nombres) {
    return nombres.reduce((total, nombre) => total + nombre, 0);
}

/**
 * Fonction qui fait la somme de plusieurs arguments
 * @param {...number} nombres - Nombres à additionner
 * @returns {number} La somme de tous les arguments
 */
function sommeMultiple(...nombres) {
    return nombres.reduce((total, nombre) => total + nombre, 0);
}

module.exports = {
    somme,
    sommeTableau,
    sommeMultiple
};
