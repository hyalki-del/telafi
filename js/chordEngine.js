import { playTone } from './audioEngine.js';
import { stringTunings, noteNames } from './fretboard.js';

export class ChordEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = Object.assign({
            totalFrets: 12,
            maxSpan: 4,
            defaultStaggerMs: 30
        }, options);

        this.chordQualities = {
            "maj": { name: "Major", types: ["maj", "maj7", "6", "sus2", "sus4", "add9"] },
            "dom": { name: "Dominant", types: ["7", "7sus4", "7b5", "9", "11", "13"] },
            "m":   { name: "Minor", types: ["m", "m6", "m7", "m7b5", "m9", "m11", "m13", "mMaj7"] },
            "aug": { name: "Augmented", types: ["aug", "aug7"] },
            "dim": { name: "Diminished", types: ["dim", "dim7"] }
        };

        this.chordFormulas = {
            "maj":      { intervals: [0, 4, 7], formula: "R, 3, 5", construction: "Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur.", soundFeel: "<b>Majör Akor:</b> Parlak, güçlü ve açık temel yapı." },
            "maj7":     { intervals: [0, 4, 7, 11], formula: "R, 3, 5, 7", construction: "Majör üçlü altyapısına büyük 7'li eklenerek kurulur.", soundFeel: "<b>Majör 7'li:</b> Caz tarzı yumuşak ve atmosferik tını." },
            "6":        { intervals: [0, 4, 7, 9], formula: "R, 3, 6, 5", construction: "Majör üçlü altyapısına büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Majör 6'lı:</b> Nostaljik pop/caz yapısı." },
            "sus2":     { intervals: [0, 2, 7], formula: "R, 2, 5", construction: "3'lü derece yerine büyük 2'li konularak kurulur.", soundFeel: "<b>Sus2:</b> Askıda kalmış ferah tını." },
            "sus4":     { intervals: [0, 5, 7], formula: "R, 4, 5", construction: "3'lü derece yerine tam 4'lü konularak kurulur.", soundFeel: "<b>Sus4:</b> Çözülme isteyen askıdaki yapı." },
            "add9":     { intervals: [0, 4, 7, 14], formula: "R, 2, 3, 5", construction: "Majör üçlüğe 9'lu eklenerek kurulur.", soundFeel: "<b>Add9:</b> Parlak ve modern pop akoru." },
            "7":        { intervals: [0, 4, 7, 10], formula: "R, 3, 5, b7", construction: "Majör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Dominant 7:</b> Blues ve rock odaklı gerilimli yapı." },
            "7sus4":    { intervals: [0, 5, 7, 10], formula: "R, 4, 5, b7", construction: "Sus4 yapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>7sus4:</b> Modern funk ve fusion akoru." },
            "7b5":      { intervals: [0, 4, 6, 10], formula: "R, 3, b5, b7", construction: "Dominant 7 akorunun 5'lisinin bellenmesiyle kurulur.", soundFeel: "<b>7b5:</b> Caz ve blues içinde renkli gerilim." },
            "9":        { intervals: [0, 4, 7, 10, 14], formula: "R, 3, 5, b7, 9", construction: "Dominant 7 akoruna büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Dominant 9:</b> Zengin blues/caz armonisi." },
            "11":       { intervals: [0, 7, 10, 14, 17], formula: "R, 5, b7, 9, 11", construction: "Genişletilmiş dominant yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Dominant 11:</b> Geniş füzyon yapısı." },
            "13":       { intervals: [0, 4, 7, 10, 14, 21], formula: "R, 3, 5, b7, 9, 13", construction: "Dominant yapıya 13'lü derece eklenerek kurulur.", soundFeel: "<b>Dominant 13:</b> Tam kapsamlı caz akoru." },
            "m":        { intervals: [0, 3, 7], formula: "R, b3, 5", construction: "Kök nota üzerine minör 3'lü ve tam 5'li eklenerek kurulur.", soundFeel: "<b>Minör Akor:</b> Duygusal ve derin hüzünlü tını." },
            "m6":       { intervals: [0, 3, 7, 9], formula: "R, b3, 6, 5", construction: "Minör üçlüye büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Minör 6'lı:</b> Sinematik zengin minör renk." },
            "m7":       { intervals: [0, 3, 7, 10], formula: "R, b3, 5, b7", construction: "Minör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Minör 7'li:</b> Dingin ve olgun minör akor." },
            "m7b5":     { intervals: [0, 3, 6, 10], formula: "R, b3, b5, b7", construction: "Yarım eksilmiş akor birleşimidir.", soundFeel: "<b>Yarım Eksilmiş:</b> Caz 2-5-1 yürüyüş temeli." },
            "m9":       { intervals: [0, 3, 7, 10, 14], formula: "R, b3, 5, b7, 9", construction: "Minör 7'li yapıya 9'lu eklenerek kurulur.", soundFeel: "<b>Minör 9'lu:</b> Modern neo-soul minör tınısı." },
            "m11":      { intervals: [0, 3, 7, 10, 14, 17], formula: "R, b3, 5, b7, 9, 11", construction: "Minör 9'lu yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Minör 11'li:</b> Geniş modal caz yapısı." },
            "m13":      { intervals: [0, 3, 7, 10, 14, 21], formula: "R, b3, 5, b7, 9, 13", construction: "Genişletilmiş minör yapıya 13'lü eklenerek kurulur.", soundFeel: "<b>Minör 13'lü:</b> Karmaşık caz armonisi." },
            "mMaj7":    { intervals: [0, 3, 7, 11], formula: "R, b3, 5, 7", construction: "Minör üçlü ve büyük 7'li aralığıyla kurulur.", soundFeel: "<b>Minör Major 7:</b> Gizemli ve gerilimli caz rengi." },
            "aug":      { intervals: [0, 4, 8], formula: "R, 3, #5", construction: "Kök nota üzerine majör 3 ve artırılmış 5'li eklenerek kurulur.", soundFeel: "<b>Artık Akor:</b> Çözülme hissi yaratan gerilim." },
            "aug7":     { intervals: [0, 4, 8, 10], formula: "R, 3, #5, b7", construction: "Artık akora küçük 7'li eklenerek kurulur.", soundFeel: "<b>Aug7:</b> Caz ve blues geçiş akoru." },
            "dim":      { intervals: [0, 3, 6], formula: "R, b3, b5", construction: "Üst üste minör 3'lü aralıklarla kurulur.", soundFeel: "<b>Diminished:</b> Dramatik ve keskin gerilim." },
            "dim7":     { intervals: [0, 3, 6, 9], formula: "R, b3, b5, bb7", construction: "Simetrik diminished 7'li yapısı.", soundFeel: "<b>Diminished 7:</b> Klasik simetrik geçiş akoru." }
        };

        this.currentRoot = 'C';
        this.currentQuality = 'maj';
        this.currentChordType = 'maj';
        this.currentPositionIndex = 0;

        this.init();
    }

    init() {
        try {
            this.renderLayout();
            this.buildControls();
            this.updateChordView();
            this.attachEventListeners();
        } catch (err) {
            console.error("ChordEngine init crash prevented:", err);
        }
    }

    renderLayout() {
        this.container.innerHTML = `
            <div>
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">1. Kök Ses (Root Note)</div>
                <div class="root-selector" id="chord-root-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
            <div>
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">2. Akor Kalitesi (Quality)</div>
                <div class="quality-selector" id="chord-quality-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
            <div>
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Safe Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    generateVoicings(rootNote, chordType) {
        try {
            const rootIndex = noteNames.indexOf(rootNote);
            const formulaObj = this.chordFormulas[chordType] || this.chordFormulas["maj"];
            const targetIntervals = formulaObj.intervals || [0, 4, 7];
            const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
            
            const openMidiNotes = [64, 59, 55, 50, 45, 40]; // High E to Low E
            let validVoicings = [];

            const evaluateAndPushVoicing = (tab, systemName, posName) => {
                let soundingNotes = [];
                let hasRoot = false;

                for (let s = 5; s >= 0; s--) {
                    const val = tab[s];
                    if (val !== "x") {
                        const fretNum = parseInt(val);
                        const midi = openMidiNotes[s] + fretNum;
                        const pc = midi % 12;
                        
                        if (!targetPitchClasses.includes(pc)) return;
                        
                        soundingNotes.push({ string: s, fret: fretNum, pc });
                        if (pc === rootIndex) hasRoot = true;
                    }
                }

                if (soundingNotes.length < 3 || !hasRoot) return;

                const frettedOnly = soundingNotes.filter(n => n.fret > 0);
                if (frettedOnly.length > 0) {
                    const minF = Math.min(...frettedOnly.map(n => n.fret));
                    const maxF = Math.max(...frettedOnly.map(n => n.fret));
                    if ((maxF - minF) > this.options.maxSpan) return;
                }

                const tabString = tab.join(',');
                if (!validVoicings.some(v => v.tab.join(',') === tabString)) {
                    validVoicings.push({
                        sys: systemName,
                        name: posName,
                        tab: tab.map(v => v.toString())
                    });
                }
            };

            // 1. SPECIFIC VERIFIED OPEN COWBOY CHORDS FOR COMMON ROOTS
            if (rootNote === "A") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "0", "2", "2", "2", "0"], "Open", "Açık A Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["x", "0", "2", "2", "1", "0"], "Open", "Açık A Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "0", "2", "0", "2", "0"], "Open", "Açık A7");
                if (chordType === "maj7") evaluateAndPushVoicing(["x", "0", "2", "1", "2", "0"], "Open", "Açık Amaj7");
                if (chordType === "sus4") evaluateAndPushVoicing(["x", "0", "2", "2", "3", "0"], "Open", "Açık Asus4");
                if (chordType === "sus2") evaluateAndPushVoicing(["x", "0", "2", "2", "0", "0"], "Open", "Açık Asus2");
            }
            if (rootNote === "C") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "3", "2", "0", "1", "0"], "Open", "Açık C Majör");
                if (chordType === "maj7") evaluateAndPushVoicing(["x", "3", "2", "0", "0", "0"], "Open", "Açık Cmaj7");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "3", "2", "3", "1", "0"], "Open", "Açık C7");
            }
            if (rootNote === "G") {
                if (chordType === "maj") evaluateAndPushVoicing(["3", "2", "0", "0", "0", "3"], "Open", "Açık G Majör");
                if (chordType === "7")   evaluateAndPushVoicing(["3", "2", "0", "0", "0", "1"], "Open", "Açık G7");
            }
            if (rootNote === "E") {
                if (chordType === "maj") evaluateAndPushVoicing(["0", "2", "2", "1", "0", "0"], "Open", "Açık E Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["0", "2", "2", "0", "0", "0"], "Open", "Açık E Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["0", "2", "0", "1", "0", "0"], "Open", "Açık E7");
                if (chordType === "m7")  evaluateAndPushVoicing(["0", "2", "2", "0", "3", "0"], "Open", "Açık Em7");
            }
            if (rootNote === "D") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "2"], "Open", "Açık D Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["x", "x", "0", "2", "3", "1"], "Open", "Açık D Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "x", "0", "2", "1", "2"], "Open", "Açık D7");
                if (chordType === "sus4") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "3"], "Open", "Açık Dsus4");
            }

            // 2. UNIVERSAL CAGED / BARRE SCANNER ACROSS ALL 12 ROOTS (D#, F#, Bb, etc.)
            for (let f = 0; f <= 12; f++) {
                // E-form root check on Low E string (string index 5)
                if ((openMidiNotes[5] + f) % 12 === rootIndex) {
                    // Standard E-form intervals relative to low E root fret f:
                    // [Root(f), 5th(f+7), Octave(f+12), 3rd(f+4), 5th(f+7), Root(f+12)] normalized to frets
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const eTab = [
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        chordType.includes('m') ? norm(f + 3) : norm(f + 4), 
                        f, 
                        f
                    ];
                    evaluateAndPushVoicing(eTab.map(String), "CAGED", `E-Formu Barre (${f}. Perde)`);
                }

                // A-form root check on A string (string index 4)
                if ((openMidiNotes[4] + f) % 12 === rootIndex) {
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const aTab = [
                        "x", 
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        chordType.includes('m') ? norm(f + 3) : norm(f + 4), 
                        f
                    ];
                    evaluateAndPushVoicing(aTab.map(String), "CAGED", `A-Formu Barre (${f}. Perde)`);
                }
            }

            // 3. ABSOLUTE SAFETY FALLBACK (Guarantees valid voicings list is never empty)
            if (validVoicings.length === 0) {
                const safeFret = (rootIndex - (40 % 12) + 12) % 12;
                validVoicings.push({
