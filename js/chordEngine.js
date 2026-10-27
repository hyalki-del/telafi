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
    "maj": { intervals: [0, 4, 7], name: "1 - 3 - 5", theoryDesc: "<b>Majör Akor:</b> Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur." },
    "m": { intervals: [0, 3, 7], name: "1 - b3 - 5", theoryDesc: "<b>Minör Akor:</b> Minör 3'lü aralığa sahiptir, duygusal ve hüzünlü tını katar." },
    "7": { intervals: [0, 4, 7, 10], name: "1 - 3 - 5 - b7", theoryDesc: "<b>Dominant 7'li Akor:</b> Çözülme isteği uyandıran gerilimli yapı." },
    "maj7": { intervals: [0, 4, 7, 11], name: "1 - 3 - 5 - 7", theoryDesc: "<b>Majör 7'li Akor:</b> Caz tarzı atmosferik ve yumuşak renk." },
    "m7": { intervals: [0, 3, 7, 10], name: "1 - b3 - 5 - b7", theoryDesc: "<b>Minör 7'li Akor:</b> Dingin ve olgun minör renk." },
    "m7b5": { intervals: [0, 3, 6, 10], name: "1 - b3 - b5 - b7", theoryDesc: "<b>Yarım Eksilmiş (m7b5):</b> Caz müzikte minor 2-5-1 temelidir." },
    "dim": { intervals: [0, 3, 6, 9], name: "1 - b3 - b5 - bb7", theoryDesc: "<b>Diminished 7'li:</b> Simetrik ve yüksek gerilimli yapı." },
    "aug": { intervals: [0, 4, 8], name: "1 - 3 - #5", theoryDesc: "<b>Artık Akor:</b> 5'li sesin tizleşmesiyle genişleyen yapı." },
    "sus2": { intervals: [0, 2, 7], name: "1 - 2 - 5", theoryDesc: "<b>Sus2:</b> 3'lü ses yerine 2'li ses içerir." },
    "sus4": { intervals: [0, 5, 7], name: "1 - 4 - 5", theoryDesc: "<b>Sus4:</b> 3'lü ses yerine 4'lü ses içerir." },
    "6": { intervals: [0, 4, 7, 9], name: "1 - 3 - 5 - 6", theoryDesc: "<b>Majör 6'lı:</b> Nostaljik ve sıcak caz/pop tınısı." },
    "m6": { intervals: [0, 3, 7, 9], name: "1 - b3 - 5 - 6", theoryDesc: "<b>Minör 6'lı:</b> Sinematik ve zengin minör renk." },
    "9": { intervals: [0, 4, 7, 10, 2], name: "1 - 3 - 5 - b7 - 9", theoryDesc: "<b>Dominant 9'lu:</b> Blues ve caz renkli yapı." },
    "maj9": { intervals: [0, 4, 7, 11, 2], name: "1 - 3 - 5 - 7 - 9", theoryDesc: "<b>Majör 9'lu:</b> Ferah ve zengin caz voicing." },
    "m9": { intervals: [0, 3, 7, 10, 2], name: "1 - b3 - 5 - b7 - 9", theoryDesc: "<b>Minör 9'lu:</b> Modern neo-soul minör yapısı." },
    "11": { intervals: [0, 4, 7, 10, 2, 5], name: "1 - 3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Dominant 11'li:</b> Füzyon tarzı geniş yapı." },
    "m11": { intervals: [0, 3, 7, 10, 2, 5], name: "1 - b3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Minör 11'li:</b> Arızasız, temizlenmiş modal caz yapısı." },
    "13": { intervals: [0, 4, 7, 10, 2, 9], name: "1 - 3 - 5 - b7 - 9 - 13", theoryDesc: "<b>Dominant 13'lü:</b> Kompleks caz armonisi." }
};

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getAllChordPositions(root, type) {
    const rootIndex = noteNames.indexOf(root);
    const eFret = (rootIndex - noteNames.indexOf("E") + 12) % 12;
    const aFret = (rootIndex - noteNames.indexOf("A") + 12) % 12;
    const dFret = (rootIndex - noteNames.indexOf("D") + 12) % 12;

    let rawPositions = [];
    const sf = (f) => (f < 0 ? f + 12 : (f > 12 ? f - 12 : f));

    if (type === "maj") {
        rawPositions.push({ sys: "CAGED", name: "E-Formu Barre", tab: [eFret, eFret, eFret+1, eFret+2, eFret+2, eFret] });
        rawPositions.push({ sys: "CAGED", name: "A-Formu Barre", tab: [aFret, aFret+2, aFret+2, aFret+2, aFret, "x"] });
        rawPositions.push({ sys: "Triad", name: "Üst 3 Tel Triad", tab: ["x", "x", "x", dFret, dFret+2, sf(dFret+4)] });
        rawPositions.push({ sys: "Drop-2", name: "D-Teli Drop-2", tab: ["x", "x", dFret, dFret+3, dFret+2, dFret] });
    } else if (type === "m") {
        rawPositions.push({ sys: "CAGED", name: "E-Formu Minör", tab: [eFret, eFret, eFret, eFret+2, eFret+2, eFret] });
        rawPositions.push({ sys: "CAGED", name: "A-Formu Minör", tab: [aFret, aFret+1, aFret+2, aFret+2, aFret, "x"] });
        rawPositions.push({ sys: "Triad", name: "Üst 3 Tel Minör Triad", tab: ["x", "x", "x", dFret, dFret+2, sf(dFret+3)] });
        rawPositions.push({ sys: "Drop-2", name: "D-Teli Minör Drop-2", tab: ["x", "x", dFret, dFret+3, dFret+2, dFret+1] });
    } else if (type === "7") {
        rawPositions.push({ sys: "CAGED", name: "E-Formu Dom7", tab: [eFret, eFret+2, eFret+1, eFret, eFret+2, eFret] });
        rawPositions.push({ sys: "CAGED", name: "A-Formu Dom7", tab: [aFret, aFret+2, aFret, aFret+2, aFret, "x"] });
        rawPositions.push({ sys: "Shell", name: "3-Ses Caz Voicing", tab: [eFret, "x", eFret+1, eFret, "x", "x"] });
        rawPositions.push({ sys: "Drop-2", name: "D-Teli Dom7", tab: ["x", "x", dFret, dFret+3, dFret+2, dFret+3] });
    } else if (type === "maj7") {
        rawPositions.push({ sys: "CAGED", name: "E-Formu Maj7", tab: [eFret, eFret+1, eFret+1, eFret, "x", eFret] });
        rawPositions.push({ sys: "CAGED", name: "A-Formu Maj7", tab: [aFret, aFret+2, aFret+1, aFret+2, aFret, "x"] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Maj7", tab: ["x", "x", dFret, dFret+2, dFret+2, dFret+2] });
    } else if (type === "m7") {
        rawPositions.push({ sys: "CAGED", name: "E-Formu Min7", tab: [eFret, eFret+2, eFret, eFret, eFret, eFret] });
        rawPositions.push({ sys: "CAGED", name: "A-Formu Min7", tab: [aFret, aFret+2, aFret, aFret+1, aFret, "x"] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Min7", tab: ["x", "x", dFret, dFret+1, dFret+1, dFret+1] });
    } else if (type === "m7b5") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Yarım Eksilmiş", tab: ["x", "x", aFret, aFret+1, aFret+1, aFret+1] });
        rawPositions.push({ sys: "Jazz Voicing", name: "E-Teli Yarım Eksilmiş", tab: ["x", "x", eFret+1, eFret+2, eFret, eFret+1] });
    } else if (type === "sus2") {
        rawPositions.push({ sys: "Standart", name: "E-Teli Sus2", tab: [eFret, "x", eFret+2, eFret+2, eFret, eFret+2] });
        rawPositions.push({ sys: "Standart", name: "A-Teli Sus2", tab: ["x", aFret, aFret+2, aFret+2, aFret, aFret] });
    } else if (type === "sus4") {
        rawPositions.push({ sys: "Standart", name: "E-Teli Sus4", tab: [eFret, eFret+2, eFret+2, eFret, eFret, eFret] });
        rawPositions.push({ sys: "Standart", name: "A-Teli Sus4", tab: ["x", aFret, aFret+2, aFret+2, aFret+3, aFret] });
    } else if (type === "dim") {
        rawPositions.push({ sys: "Diminished", name: "A-Teli Kök Dim7", tab: ["x", "x", aFret+1, aFret+2, aFret+1, aFret+3] });
        rawPositions.push({ sys: "Diminished", name: "E-Teli Kök Dim7", tab: ["x", "x", eFret+1, eFret+2, eFret+2, eFret+3] });
    } else if (type === "aug") {
        rawPositions.push({ sys: "Augmented", name: "A-Teli Aug", tab: ["x", "x", aFret+2, aFret+2, aFret+3, aFret+1] });
        rawPositions.push({ sys: "Augmented", name: "E-Teli Aug", tab: [eFret, eFret+1, eFret+1, eFret+2, "x", eFret] });
    } else if (type === "6") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Majör 6", tab: ["x", aFret, aFret+2, aFret+2, aFret, aFret+2] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Majör 6", tab: ["x", "x", dFret, dFret+2, dFret+2, dFret+2] });
    } else if (type === "m6") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Minör 6", tab: ["x", aFret, aFret+2, aFret+2, aFret, aFret+1] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Minör 6", tab: ["x", "x", dFret, dFret+2, dFret+2, dFret+1] });
    } else if (type === "9") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Dom 9", tab: ["x", aFret, aFret+2, aFret+3, aFret+2, aFret+2] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Dom 9", tab: ["x", "x", dFret, dFret+3, dFret+2, dFret+2] });
    } else if (type === "maj9") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Maj9", tab: ["x", aFret, aFret+2, aFret+1, aFret+1, aFret+2] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Maj9", tab: ["x", "x", dFret, dFret+2, dFret+2, dFret+2] });
    } else if (type === "m9") {
        rawPositions.push({ sys: "Jazz Voicing", name: "A-Teli Minör 9", tab: ["x", aFret, aFret+2, aFret, aFret, sf(aFret+3)] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Min9", tab: ["x", "x", dFret, dFret+1, dFret, dFret+1] });
    } else if (type === "11") {
        rawPositions.push({ sys: "Modern Voicing", name: "Kompakt Dom 11", tab: ["x", aFret, "x", aFret+3, aFret+3, aFret+3] });
        rawPositions.push({ sys: "Jazz Voicing", name: "Geniş Dom 11", tab: [eFret, "x", eFret+1, eFret+1, eFret+1, "x"] });
    } else if (type === "m11") {
        rawPositions.push({ sys: "Modern Voicing", name: "Kompakt Minör 11", tab: ["x", aFret, "x", aFret+1, aFret+3, aFret+3] });
        rawPositions.push({ sys: "Drop-2", name: "D-Teli Min11", tab: ["x", "x", dFret, dFret+1, dFret+3, dFret+3] });
    } else if (type === "13") {
        rawPositions.push({ sys: "Jazz Voicing", name: "Kompakt Dom 13", tab: ["x", aFret, "x", aFret+3, aFret+4, aFret+2] });
        rawPositions.push({ sys: "Drop-2", name: "Üst 4 Tel Dom 13", tab: ["x", "x", dFret, dFret+3, dFret+4, dFret+2] });
    }

    // SPAN GUARD ve Doğruluk Süzgeci:
    let validPositions = [];
    rawPositions.forEach(p => {
        let frets = p.tab.filter(v => v !== "x").map(Number);
        if (frets.length === 0) return;

        let minFret = Math.min(...frets);
        let maxFret = Math.max(...frets);
        let span = maxFret - minFret;

        // Perde açıklığı max 4 olacak ve klavye sınırlarını aşmayacak
        if (span <= 4 && maxFret <= 15) {
            validPositions.push({
                sys: p.sys,
                name: p.name,
                tab: p.tab.map(v => (v === "x" ? "x" : v.toString()))
            });
        }
    });

    if (validPositions.length === 0) {
        validPositions.push({
            sys: "Standart",
            name: "Temel Pozisyon",
            tab: [eFret.toString(), "x", "x", "x", "x", "x"]
        });
    }

    return validPositions;
}
