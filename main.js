function separar() {
  let palabra = document.getElementById('wordInput').value.toLowerCase();
  let silabas = separarSilabas(palabra);
  let resultado = silabas.join('-');
  document.getElementById('resultArea').innerText = resultado;

  detectarSilabaTonica(silabas);

  //detectarConjuntosVocales(silabas); work in progress
}

function toggleDark() {
  document.body.classList.toggle('dark-mode');
}

function esHiato(letras) {
  const vocales = letras.toLowerCase();
  const abiertas = ['a','e','o',
                    'A','E','O'];
  const cerradas = ['í','ú',
                    'Í','Ú'];
  // Busca si hay una cerrada tildada (representada como í ó ú por ejemplo)
  const tieneTilde = /[íúÍÚ]/.test(vocales);
  // Hiato típico: abierta + cerrada tildada, o viceversa
  return (abiertas.includes(vocales[0]) && cerradas.includes(vocales[1]) && tieneTilde) ||
         (cerradas.includes(vocales[0]) && abiertas.includes(vocales[1]) && tieneTilde);
}

function esDiptongo(letras) {
  const vocales = letras.toLowerCase();
  const abiertas = ['a','e','o',
                    'A','E','O'];
  const cerradas = ['i','u','ü',
                    'O','U','Ü'];
  // Las cerradas no deben llevar tilde
  const sinTilde = !/[íúÍÚ]/.test(vocales);
  return (abiertas.includes(vocales[0]) && cerradas.includes(vocales[1]) && sinTilde) ||
         (cerradas.includes(vocales[0]) && abiertas.includes(vocales[1]) && sinTilde) ||
         (cerradas.includes(vocales[0]) && cerradas.includes(vocales[1]) && sinTilde);
}

function esTriptongo(letras) {
  const vocales = letras.toLowerCase();
  const cerradas = ['i','u',
                    'I', 'U'];
  const abiertas = ['a','e','o','á','é','ó',
                    'A','E','O','Á','É','Ó'];
  // Las vocales deben ser: cerrada + abierta + cerrada, sin tilde en las cerradas
  return cerradas.includes(vocales[0]) &&
         abiertas.includes(vocales[1]) &&
         cerradas.includes(vocales[2]) &&
         !/[íúÍÚ]/.test(vocales[0]) &&
         !/[íúÍÚ]/.test(vocales[2]);
}

function esUndefined(valor) {
  return valor === undefined;
}

function esDigrafoConU(palabra, i) {
  const Uocales = ['e','i','é','í',
                  'E','I','É','Í'];
  if ('u' == palabra[i] || palabra[i] === 'U') {
    if ('q' == palabra[i - 1] || 'Q' == palabra[i - 1]) {
      return true;
    }
    else if (('g' == palabra[i - 1] || 'G' == palabra[i - 1])
      && Uocales.includes(palabra[i + 1])) {
      return true;
    }
    else {
      return false;
    }
  }
}

function separarSilabas(palabra) {
  const vocales = ['a','e','i','o','u','á','é','í','ó','ú','ü',
                  'A','E','I','O','U','Á','É','Í','Ó','Ú','Ü'];
  const digrafos = [
    'CH', 'Ch', 'cH', 'ch',
    'LL', 'Ll', 'lL', 'll',
    'RR', 'Rr', 'rR', 'rr',
    'QU', 'Qu', 'qU', 'qu',
    'GU', 'Gu', 'gU', 'gu'
  ];
  const conjuntosConsonanticos = [
    'BR', 'Br', 'bR', 'br',
    'BL', 'Bl', 'bL', 'bl',
    'CR', 'Cr', 'cR', 'cr',
    'CL', 'Cl', 'cL', 'cl',
    'DR', 'Dr', 'dR', 'dr',
    'FR', 'Fr', 'fR', 'fr',
    'FL', 'Fl', 'fL', 'fl',
    'GR', 'Gr', 'gR', 'gr',
    'GL', 'Gl', 'gL', 'gl',
    'PR', 'Pr', 'pR', 'pr',
    'PL', 'Pl', 'pL', 'pl',
    'TR', 'Tr', 'tR', 'tr',
    'TL', 'Tl', 'tL', 'tl'
  ]; // 'TL' oficialmente es un conjunto válido (tran-sa-tlán-ti-co), aunque en ciertas regiones deciden separarlo (tran-sat-lán-ti-co)

  let silabas = [];
  let i = 0;

  //si es solo una letra esa es la única sílaba
  if (palabra.length === 1) {
    return [palabra];
  }

  while (i < palabra.length) {
    let silaba = '';

    // Acumular hasta la primera vocal
    while (i < palabra.length && !vocales.includes(palabra[i].toLowerCase())){
      silaba += palabra[i];
      i ++;
      if (esDigrafoConU(palabra.toLowerCase(), i)) { // hay que avanzar una posición porque la U no la consideramos como vocal
        silaba += palabra[i];
        i ++;
      }
    }
    silaba += palabra[i]; // hay que incluir la primera vocal

    // Vocales
    if (!esUndefined(palabra[i+1]) && !esUndefined(palabra[i+2]) &&
      esTriptongo(palabra[i] + palabra[i+1] + palabra[i+2])) {
      silaba += palabra[i+1] + palabra[i+2];
      i += 2;
      // no existen triptongos con H intercalada
    } 
    else if (!esUndefined(palabra[i+1]) && !esUndefined(palabra[i+2]) &&
      'h' == palabra[i+1] && // comprobar las H intercaladas en medio de un diptongo TODO
      esDiptongo(palabra[i] + palabra[i+2])) {
        // palabra "ahuecar" queremos que el diptongo sea con "hue" no con "ahu"
      if (!esDiptongo(palabra[i+2] + palabra[i+3])) {
        silaba += palabra[i+1] + palabra[i+2];
        i += 2;
      }
    } 
    else if (!esUndefined(palabra[i+1]) &&
      esDiptongo(palabra[i] + palabra[i+1])) {
      silaba += palabra[i+1];
      i += 1;
    } 
    else if (!esUndefined(palabra[i+1]) &&
      esHiato(palabra[i] + palabra[i+1])) {
    }

    // Look ahead
    let j = i + 1;
    let silaba2 = '';
    while (j < palabra.length && !vocales.includes(palabra[j].toLowerCase())) {
      silaba2 += palabra[j];
      j ++;
    }

    if (j >= palabra.length) {
      silaba += silaba2;
      silabas.push(silaba);
      break;
    }

    if (silaba2.length == 1) {
      // si hay una letra solo pude ser de la siguiente silaba

      if (silaba2.length == 1 && j == palabra.length) {
        silaba += silaba2;
        silabas.push(silaba);
        break;
      }
      else if (silaba2.length == 1 && j < palabra.length) {
        silabas.push(silaba);
      }
      i ++; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
    }

    else if (silaba2.length == 2) {
      /* si son 2 hay que mirar si son digrafos o conjuntosConsonanticos
              en cuyo caso las dos van a la siguiente silaba,
              de lo contrario una letra a cada silaba
    */
      if (!digrafos.includes(silaba2) && !conjuntosConsonanticos.includes(silaba2)) {
        silaba += silaba2[0];
        i += 2; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
      } else {
        i++; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
      }
      silabas.push(silaba);
    }

    else if (silaba2.length == 3) {
      /* si son 3 hay que mirar si las dos ultimas son digrafos o conjuntosConsonanticos
              en cuyo caso la primera letra sera de la primera silaba y las ultimas letras de la segunda silaba,
              de lo contrario las dos primeras letras para la primera silaba y la ultima letra para la segunda silaba
      */
      if (!digrafos.includes(silaba2[1] + silaba2[2]) && !conjuntosConsonanticos.includes(silaba2[1] + silaba2[2])) {
        silaba += silaba2[0] + silaba2[1];
        i += 3; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
      } else {
        silaba += silaba2[0];
        i += 2; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
      }
      silabas.push(silaba);
    }

    else if (silaba2.length == 4) {
      // si son 4 las dos primeras para la silaba anterior y las dos ultimas para la siguiente
      silaba += silaba2[0] + silaba2[1];
      i += 3;
      silabas.push(silaba);
    }

    else {
      // no hay más letras por lo que la silaba esta completa
      silabas.push(silaba);
      i++; // colocar el puntero en la primera letra que ya no pertenece a esa silaba
    }

    if (esUndefined(palabra[i])) {
      // comprobar que haya siguiente letra
      break;
    }
  
  }

  console.log(silabas.join('-'));
  return silabas;

}
/* TEST

Ahijado
Prohibir
Ahuecar
Ahuyentar
Vehículo
Cacahuete
Bahía
Rehén
Transatlántico
*/

function detectarSilabaTonica(silabas) {
  const tildes = /[áéíóúÁÉÍÓÚ]/;

  // buscar una sílaba con tilde (las esdrujulas y sobresdrujulas siempre llevan tilde)
  for (let i = 0; i < silabas.length; i++) {
    if (tildes.test(silabas[i])) {
      return i;
    }
  }

  // si es monosílaba, es la tonica por defecto
  if (silabas.length === 1) {
    return 0;
  }

  // aplicar reglas de acentuacion
  const palabra = silabas.join("");
  const ultimaLetra = palabra.slice(-1).toLowerCase();

  const terminaEnVocalONS = /[aeiounsAEIOUNS]/.test(ultimaLetra);

  if (terminaEnVocalONS) {
    console.log({"silabas": silabas, "tonica": silabas.length - 2});
    return silabas.length - 2; // llana
  } else {
    console.log({"silabas": silabas, "tonica": silabas.length - 1});
    return silabas.length - 1; // aguda
  }
}

function eliminarConsonantes(texto) {
  return texto.replace(/[^aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/g, "");
}


function detectarConjuntosVocales(silabas) {
  let triptongos = [];
  let diptongos = [];
  let hiatos = [];
  for (let i = 0; i < silabas.length; i++) {
    let silaba = silabas[i];
    let element = eliminarConsonantes(silaba);// quitar las consonantes para que la validacion funcione

    if (esTriptongo(element)) {
      triptongos.push(silabas[i]);
    } 
    else if (esDiptongo(element)) {
      diptongos.push(silabas[i]);
    }
    else if (esHiato(element)) {
      hiatos.push(silabas[i]);
    }
  }
  console.log({
    "palabra": silabas.join(""),
    "triptongos": triptongos,
    "diptongos": diptongos,
    "hiatos": hiatos
  });
}

function batch() {
  let palabras = document.getElementById('inBatch').value;
  let lista = palabras.match(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+|\d|\W/g);

  let separadas = [];

  lista.forEach(element => {
    separadas.push(separarSilabas(element));
  });
  
  let fin = "";

  separadas.forEach(element => {
    fin += element.join("-");
  });
  

  console.log(fin.trimEnd());
  
  document.getElementById("outBatch").value = fin.trimEnd();

}