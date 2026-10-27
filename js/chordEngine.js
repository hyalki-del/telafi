export const chordTypes = [
    { id: "maj", name: "Majör" },
    { id: "m", name: "Minör" },
    { id: "7", name: "Dom 7" },
    { id: "maj7", name: "Maj7" },
    { id: "m7", name: "Minör 7" },
    { id: "m7b5", name: "Minör 7♭5" },
    { id: "dim", name: "Diminished" },
    { id: "aug", name: "Augmented" },
    { id: "sus2", name: "Sus2" },
    { id: "sus4", name: "Sus4" },
    { id: "6", name: "Majör 6" },
    { id: "m6", name: "Minör 6" },
    { id: "9", name: "Dom 9" },
    { id: "maj9", name: "Maj9" },
    { id: "m9", name: "Minör 9" },
    { id: "11", name: "Dom 11" },
    { id: "m11", name: "Minör 11" },
    { id: "13", name: "Dom 13" }
];

export const chordFormulas = {
    "maj": { intervals: [0, 4, 7], name: "1 - 3 - 5", theoryDesc: "<b>Majör Akor:</b> Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur. Parlak ve kararlı bir tını verir." },
    "m": { intervals: [0, 3, 7], name: "1 - b3 - 5", theoryDesc: "<b>Minör Akor:</b> Minör 3'lü aralığa sahiptir, duygusal ve hüzünlü tını katar." },
    "7": { intervals: [0, 4, 7, 10], name: "1 - 3 - 5 - b7", theoryDesc: "<b>Dominant 7'li Akor:</b> Çözülme isteği uyandıran gerilimli bir yapıya sahiptir." },
    "maj7": { intervals: [0, 4, 7, 11], name: "1 - 3 - 5 - 7", theoryDesc: "<b>Majör 7'li Akor:</b> Caz tarzı atmosferik ve yumuşak renge sahiptir." },
    "m7": { intervals: [0, 3, 7, 10], name: "1 - b3 - 5 - b7", theoryDesc: "<b>Minör 7'li Akor:</b> Dingin ve olgun minör renk sunar." },
    "m7b5": { intervals: [0, 3, 6, 10], name: "1 - b3 - b5 - b7", theoryDesc: "<b>Minör 7 bemol 5 (Yarım Eksilmiş):</b> Caz müzikte minor 2-5-1 yürüyüşlerinin temelidir." },
    "dim": { intervals: [0, 3, 6, 9], name: "1 - b3 - b5 - bb7", theoryDesc: "<b>Diminished 7'li Akor:</b> Üst üste binmiş minör üçlülerden oluşan simetrik ve yüksek gerilimli bir akordur." },
    "aug": { intervals: [0, 4, 8], name: "1 - 3 - #5", theoryDesc: "<b>Artık Akor:</b> 5'li sesin tizleşmesiyle genişleyen sürprizli bir etki bırakır." },
    "sus2": { intervals: [0, 2, 7], name: "1 - 2 - 5", theoryDesc: "<b>Sus2:</b> 3'lü ses yerine 2'li ses içerir, açık ve akıcıdır." },
    "sus4": { intervals: [0, 5, 7], name: "1 - 4 - 5", theoryDesc: "<b>Sus4:</b> 3'lü ses yerine 4'lü ses içerir, ana akora çözülme beklentisi yaratır." },
    "6": { intervals: [0, 4, 7, 9], name: "1 - 3 - 5 - 6", theoryDesc: "<b>Majör 6'lı Akor:</b> Majör üçlüye eklenen 6'lı derece ile nostaljik, tatlı ve sıcak bir caz/pop tınısı yaratır." },
    "m6": { intervals: [0, 3, 7, 9], name: "1 - b3 - 5 - 6", theoryDesc: "<b>Minör 6'lı Akor:</b> Gizemli, sinematik ve özellikle caz baladlarında sıkça duyulan hüzünlü ama zengin bir renktir." },
    "9": { intervals: [0, 4, 7, 10, 2], name: "1 - 3 - 5 - b7 - 9", theoryDesc: "<b>Dominant 9'lu Akor:</b> Blues, funk ve caz müzikte dominant 7'liye renk katan 9'lu eklenmiş versiyonudur." },
    "maj9": { intervals: [0, 4, 7, 11, 2], name: "1 - 3 - 5 - 7 - 9", theoryDesc: "<b>Majör 9'lu Akor:</b> Caz ve R&B tarzının vazgeçilmezi olan son derece zengin ve ferah bir tını sunar." },
    "m9": { intervals: [0, 3, 7, 10, 2], name: "1 - b3 - 5 - b7 - 9", theoryDesc: "<b>Minör 9'lu Akor:</b> Modern caz ve neo-soul armonilerinin kalbinde yer alan yumuşak bir minör renktir." },
    "11": { intervals: [0, 4, 7, 10, 2, 5], name: "1 - 3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Dominant 11'li Akor:</b> Askıda kalmış, geniş ve füzyon tarzı bir tını yaratır." },
    "m11": { intervals: [0, 3, 7, 10, 2, 5], name: "1 - b3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Minör 11'li Akor:</b> Modal cazda kullanılan, çok katmanlı ve atmosferik minör yapıdır." },
    "13": { intervals: [0, 4, 7, 10, 2, 9], name: "1 - 3 - 5 - b7 - 9 - 13", theoryDesc: "<b>Dominant 13'lü Akor:</b> Kompleks caz armonilerinin zirvelerinden biri olup parlak bir üst çatı sunar." }
};

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getAllChordPositions(root, type) {
    const rootIndex = noteNames.indexOf(root);
    const eFret = (rootIndex - noteNames.indexOf("E") + 12) % 12;
    const aFret = (rootIndex - noteNames.indexOf("A") + 12) % 12;
    const dFret = (rootIndex - noteNames.indexOf("D") + 12) % 12;
    const gFret = (rootIndex - noteNames.indexOf("G") + 12) % 12;

    let positions = [];
    const sf = (f) => (f < 0 ? f + 12 : (f > 12 ? f - 12 : f));

    if (type === "maj") {
        positions.push({ sys: "CAGED", name: "E-Formu Barre (Kök)", tab: [eFret, eFret, eFret+1, eFret+2, eFret+2, eFret] });
        positions.push({ sys: "CAGED", name: "A-Formu Barre (Kök)", tab: [aFret, aFret+2, aFret+2, aFret+2, aFret, "x"] });
        positions.push({ sys: "Triad", name: "Üst 3 Tel Kompakt Triad", tab: [sf(gFret+2), gFret, gFret, "x", "x", "x"] });
        positions.push({ sys: "Drop-2", name: "D-Teli Tabanlı Drop-2", tab: [dFret+2, dFret+3, dFret+2, dFret, "x", "x"] });
    } else if (type === "m") {
        positions.push({ sys: "CAGED", name: "E-Formu Minör", tab: [eFret, eFret, eFret, eFret+2, eFret+2, eFret] });
        positions.push({ sys: "CAGED", name: "A-Formu Minör", tab: [aFret, aFret+1, aFret+2, aFret+2, aFret, "x"] });
        positions.push({ sys: "Triad", name: "Üst 3 Tel Minör Triad", tab: [sf(gFret+1), gFret, gFret, "x", "x", "x"] });
        positions.push({ sys: "Drop-2", name: "D-Teli Tabanlı Minör Drop-2", tab: [dFret+1, dFret+3, dFret+2, dFret, "x", "x"] });
    } else if (type === "7") {
        positions.push({ sys: "CAGED", name: "E-Formu Dom7", tab: [eFret, eFret, eFret+1, eFret, eFret+2, eFret] });
        positions.push({ sys: "CAGED", name: "A-Formu Dom7", tab: [aFret, aFret+2, aFret, aFret+2, aFret, "x"] });
        positions.push({ sys: "Shell", name: "3-Ses Caz Voicing", tab: ["x", eFret, eFret+1, "x", "x", eFret] });
        positions.push({ sys: "Drop-2", name: "D-Teli Dom7", tab: [dFret+3, dFret+2, dFret+3, dFret, "x", "x"] });
    } else if (type === "maj7") {
        positions.push({ sys: "CAGED", name: "E-Formu Maj7", tab: [eFret, sf(eFret-1), eFret+1, eFret+1, "x", eFret] });
        positions.push({ sys: "CAGED", name: "A-Formu Maj7", tab: [aFret, aFret+2, aFret+1, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Maj7", tab: [dFret+2, dFret+2, dFret+2, dFret, "x", "x"] });
    } else if (type === "m7") {
        positions.push({ sys: "CAGED", name: "E-Formu Min7", tab: [eFret, eFret, eFret, eFret, eFret+2, eFret] });
        positions.push({ sys: "CAGED", name: "A-Formu Min7", tab: [aFret, aFret+1, aFret, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Min7", tab: [dFret+1, dFret+1, dFret+1, dFret, "x", "x"] });
    } else if (type === "m7b5") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Yarım Eksilmiş", tab: [aFret+1, aFret+1, aFret, aFret+1, "x", "x"] });
        positions.push({ sys: "Jazz Voicing", name: "E-Teli Yarım Eksilmiş", tab: [eFret+1, eFret, eFret+1, eFret+2, "x", "x"] });
    } else if (type === "sus2") {
        positions.push({ sys: "Standart", name: "E-Teli Sus2", tab: [eFret+2, eFret, eFret+2, eFret+2, "x", eFret] });
        positions.push({ sys: "Standart", name: "A-Teli Sus2", tab: [aFret, aFret, aFret+2, aFret+2, aFret, "x"] });
    } else if (type === "sus4") {
        positions.push({ sys: "Standart", name: "E-Teli Sus4", tab: [eFret, eFret, eFret+2, eFret+2, eFret+2, eFret] });
        positions.push({ sys: "Standart", name: "A-Teli Sus4", tab: [aFret, aFret+3, aFret+2, aFret+2, aFret, "x"] });
    } else if (type === "dim") {
        positions.push({ sys: "Diminished", name: "A-Teli Kök Dim7", tab: [aFret+3, aFret+1, aFret+2, aFret+1, "x", "x"] });
        positions.push({ sys: "Diminished", name: "E-Teli Kök Dim7", tab: [eFret+3, eFret+2, eFret+1, eFret+2, "x", "x"] });
    } else if (type === "aug") {
        positions.push({ sys: "Augmented", name: "A-Teli Aug", tab: [aFret+1, aFret+2, aFret+2, aFret+3, "x", "x"] });
        positions.push({ sys: "Augmented", name: "E-Teli Aug", tab: [eFret, eFret+1, eFret+1, eFret+2, "x", eFret] });
    } else if (type === "6") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Majör 6", tab: [aFret+2, aFret, aFret+2, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Majör 6", tab: [dFret+2, dFret+2, dFret+2, dFret, "x", "x"] });
    } else if (type === "m6") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Minör 6", tab: [aFret+1, aFret, aFret+2, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Minör 6", tab: [dFret+1, dFret+2, dFret+2, dFret, "x", "x"] });
    } else if (type === "9") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Dom 9", tab: [aFret+2, aFret+2, aFret+3, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Dom 9", tab: [dFret+2, dFret+2, dFret+3, dFret, "x", "x"] });
    } else if (type === "maj9") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Maj9", tab: [aFret+2, aFret+1, aFret+1, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Maj9", tab: [dFret+2, aFret ? sf(aFret+1): 1, dFret+2, dFret, "x", "x"] });
    } else if (type === "m9") {
        positions.push({ sys: "Jazz Voicing", name: "A-Teli Minör 9", tab: [aFret+2, aFret, aFret, aFret+2, aFret, "x"] });
        positions.push({ sys: "Drop-2", name: "Üst 4 Tel Min9", tab: [dFret+1, dFret, dFret+1, dFret, "x", "x"] });
    } else if (type === "11") {
        positions.push({ sys: "Modern Voicing", name: "Kompakt Dom 11", tab: [aFret+1, aFret+1, aFret+3, aFret+2, aFret, "x"] });
    } else if (type === "m11") {
        positions.push({ sys: "Modern Voicing", name: "Kompakt Minör 11", tab: [aFret+1, aFret+1, aFret+1, aFret+2, aFret, "x"] });
    } else if (type === "13") {
        positions.push({ sys: "Jazz Voicing", name: "Kompakt Dom 13", tab: [aFret+2, aFret+4, aFret+3, aFret+2, aFret, "x"] });
    }

    return positions.map(p => ({
        sys: p.sys,
        name: p.name,
        tab: p.tab.map(v => (typeof v === 'number' && (v < 0 || v > 15)) ? "x" : v.toString())
    }));
}
