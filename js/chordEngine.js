import { playTone } from './audioEngine.js';
import { stringTunings, noteNames } from './fretboard.js';

// Universal note normalization to prevent sharp/flat index mismatches
const NOTE_ALIASES = {
    'C': 0, 'B#': 0, 'Dbb': 0,
    'C#': 1, 'Db': 1, 'Bx': 1,
    'D': 2, 'C##': 2, 'Ebb': 2,
    'D#': 3, 'Eb': 3, 'Fbb': 3,
    'E': 4, 'Dx': 4, 'Fb': 4,
    'F': 5, 'E#': 5, 'Gbb': 5,
    'F#': 6, 'Gb': 6, 'Ex': 6,
    'G': 7, 'F##': 7, 'Abb': 7,
    'G#': 8, 'Ab': 8,
    'A': 9, 'G##': 9, 'Bbb': 9,
    'A#': 10, 'Bb': 10, 'Cbb': 10,
    'B': 11, 'Ax': 11, 'Cb': 11
};

function getNoteIndex(note) {
    if (!note) return 0;
    const clean = note.trim();
    if (NOTE_ALIASES[clean] !== undefined) return NOTE_ALIASES[clean];
    if (Array.isArray(noteNames) && noteNames.includes(clean)) {
        return noteNames.indexOf(clean);
    }
    return 0;
}

const SAFE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class ChordEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = Object.assign({
            totalFrets: 12,
            maxSpan: 4,
            defaultStaggerMs: 30
        }, options);

        this.notesList = (Array.isArray(noteNames) && noteNames.length > 0) ? noteNames : SAFE_NOTES;

        this.chordQualities = {
            "maj": { name: "Major", types: ["maj", "maj7", "6", "sus2", "sus4", "add9"] },
            "dom": { name: "Dominant", types: ["7", "7sus4", "7b5", "9", "11", "13"] },
            "m":   { name: "Minor", types: ["m", "m6", "m7", "m7b5", "m9", "m11", "m13", "mMaj7"] },
            "aug": { name: "Augmented", types: ["aug", "aug7"] },
            "dim": { name: "Diminished", types: ["dim", "dim7"] }
        };

        this.chordFormulas = {
            "maj":      { intervals: [0, 4, 7], required: [0, 4, 7], formula: "R, 3, 5", construction: "Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur.", soundFeel: "<b>Majör Akor:</b> Parlak, güçlü ve açık temel yapı." },
            "maj7":     { intervals: [0, 4, 7, 11], required: [0, 4, 11], formula: "R, 3, 5, 7", construction: "Majör üçlü altyapısına büyük 7'li eklenerek kurulur.", soundFeel: "<b>Majör 7'li:</b> Caz tarzı yumuşak ve atmosferik tını." },
            "6":        { intervals: [0, 4, 7, 9], required: [0, 4, 9], formula: "R, 3, 6, 5", construction: "Majör üçlü altyapısına büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Majör 6'lı:</b> Nostaljik pop/caz yapısı." },
            "sus2":     { intervals: [0, 2, 7], required: [0, 2, 7], formula: "R, 2, 5", construction: "3'lü derece yerine büyük 2'li konularak kurulur.", soundFeel: "<b>Sus2:</b> Askıda kalmış ferah tını." },
            "sus4":     { intervals: [0, 5, 7], required: [0, 5, 7], formula: "R, 4, 5", construction: "3'lü derece yerine tam 4'lü konularak kurulur.", soundFeel: "<b>Sus4:</b> Çözülme isteyen askıdaki yapı." },
            "add9":     { intervals: [0, 4, 7, 14], required: [0, 4, 14], formula: "R, 2, 3, 5", construction: "Majör üçlüğe 9'lu eklenerek kurulur.", soundFeel: "<b>Add9:</b> Parlak ve modern pop akoru." },
            "7":        { intervals: [0, 4, 7, 10], required: [0, 4, 10], formula: "R, 3, 5, b7", construction: "Majör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Dominant 7:</b> Blues ve rock odaklı gerilimli yapı." },
            "7sus4":    { intervals: [0, 5, 7, 10], required: [0, 5, 10], formula: "R, 4, 5, b7", construction: "Sus4 yapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>7sus4:</b> Modern funk ve fusion akoru." },
            "7b5":      { intervals: [0, 4, 6, 10], required: [0, 4, 6, 10], formula: "R, 3, b5, b7", construction: "Dominant 7 akorunun 5'lisinin bellenmesiyle kurulur.", soundFeel: "<b>7b5:</b> Caz ve blues içinde renkli gerilim." },
            "9":        { intervals: [0, 4, 7, 10, 14], required: [0, 4, 10, 14], formula: "R, 3, 5, b7, 9", construction: "Dominant 7 akoruna büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Dominant 9:</b> Zengin blues/caz armonisi." },
            "11":       { intervals: [0, 7, 10, 14, 17], required: [0, 10, 17], formula: "R, 5, b7, 9, 11", construction: "Genişletilmiş dominant yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Dominant 11:</b> Geniş füzyon yapısı." },
            "13":       { intervals: [0, 4, 7, 10, 14, 21], required: [0, 4, 10, 21], formula: "R, 3, 5, b7, 9, 13", construction: "Dominant yapıya 13'lü derece eklenerek kurulur.", soundFeel: "<b>Dominant 13:</b> Tam kapsamlı caz akoru." },
            "m":        { intervals: [0, 3, 7], required: [0, 3, 7], formula: "R, b3, 5", construction: "Kök nota üzerine minör 3'lü ve tam 5'li eklenerek kurulur.", soundFeel: "<b>Minör Akor:</b> Duygusal ve derin hüzünlü tını." },
            "m6":       { intervals: [0, 3, 7, 9], required: [0, 3, 9], formula: "R, b3, 6, 5", construction: "Minör üçlüye büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Minör 6'lı:</b> Sinematik zengin minör renk." },
            "m7":       { intervals: [0, 3, 7, 10], required: [0, 3, 10], formula: "R, b3, 5, b7", construction: "Minör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Minör 7'li:</b> Dingin ve olgun minör akor." },
            "m7b5":     { intervals: [0, 3, 6, 10], required: [0, 3, 6, 10], formula: "R, b3, b5, b7", construction: "Yarım eksilmiş akor birleşimidir.", soundFeel: "<b>Yarım Eksilmiş:</b> Caz 2-5-1 yürüyüş temeli." },
            "m9":       { intervals: [0, 3, 7, 10, 14], required: [0, 3, 10, 14], formula: "R, b3, 5, b7, 9", construction: "Minör 7'li yapıya 9'lu eklenerek kurulur.", soundFeel: "<b>Minör 9'lu:</b> Modern neo-soul minör tınısı." },
            "m11":      { intervals: [0, 3, 7, 10, 14, 17], required: [0, 3, 10, 17], formula: "R, b3, 5, b7, 9, 11", construction: "Minör 9'lu yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Minör 11'li:</b> Geniş modal caz yapısı." },
            "m13":      { intervals: [0, 3, 7, 10, 14, 21], required: [0, 3, 10, 21], formula: "R, b3, 5, b7, 9, 13", construction: "Genişletilmiş minör yapıya 13'lü eklenerek kurulur.", soundFeel: "<b>Minör 13'lü:</b> Karmaşık caz armonisi." },
            "mMaj7":    { intervals: [0, 3, 7, 11], required: [0, 3, 11], formula: "R, b3, 5, 7", construction: "Minör üçlü ve büyük 7'li aralığıyla kurulur.", soundFeel: "<b>Minör Major 7:</b> Gizemli ve gerilimli caz rengi." },
            "aug":      { intervals: [0, 4, 8], required: [0, 4, 8], formula: "R, 3, #5", construction: "Kök nota üzerine majör 3 ve artırılmış 5'li eklenerek kurulur.", soundFeel: "<b>Artık Akor:</b> Çözülme hissi yaratan gerilim." },
            "aug7":     { intervals: [0, 4, 8, 10], required: [0, 4, 8, 10], formula: "R, 3, #5, b7", construction: "Artık akora küçük 7'li eklenerek kurulur.", soundFeel: "<b>Aug7:</b> Caz ve blues geçiş akoru." },
            "dim":      { intervals: [0, 3, 6], required: [0, 3, 6], formula: "R, b3, b5", construction: "Üst üste minör 3'lü aralıklarla kurulur.", soundFeel: "<b>Diminished:</b> Dramatik ve keskin gerilim." },
            "dim7":     { intervals: [0, 3, 6, 9], required: [0, 3, 6, 9], formula: "R, b3, b5, bb7", construction: "Simetrik diminished 7'li yapısı.", soundFeel: "<b>Diminished 7:</b> Klasik simetrik geçiş akoru." }
        };

        this.currentRoot = 'C';
        this.currentQuality = 'maj';
        this.currentChordType = 'maj';
        this.currentPositionIndex = 0;

        this.init();
    }

    init() {
        try {
            if (!this.container) return;
            this.renderLayout();
            this.buildControls();
            this.updateChordView();
            this.attachEventListeners();
        } catch (err) {
            console.error("ChordEngine init error:", err);
        }
    }

    renderLayout() {
        if (!this.container) return;
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Validated Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    generateVoicings(rootNote, chordType) {
        try {
            const rootIndex = getNoteIndex(rootNote);
            const formulaObj = this.chordFormulas[chordType] || this.chordFormulas["maj"];
            const targetIntervals = formulaObj.intervals || [0, 4, 7];
            const requiredIntervals = formulaObj.required || [0, 4, 7];
            
            const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
            const requiredPitchClasses = requiredIntervals.map(i => (rootIndex + i) % 12);
            
            // Standard Low-to-High String Order (6th string to 1st string)
            const openMidiNotes = [40, 45, 50, 55, 59, 64]; 
            let validVoicings = [];

            const evaluateAndPushVoicing = (tab, systemName, posName) => {
                let soundingNotes = [];
                let presentPitchClasses = new Set();
                let hasRoot = false;

                for (let s = 0; s < 6; s++) {
                    const val = tab[s];
                    if (val !== "x" && val !== null && val !== undefined) {
                        const fretNum = parseInt(val);
                        if (isNaN(fretNum)) return;
                        const midi = openMidiNotes[s] + fretNum;
                        const pc = midi % 12;
                        
                        // Strict rule: Any unauthorized note automatically rejects the voicing
                        if (!targetPitchClasses.includes(pc)) return;
                        
                        soundingNotes.push({ string: s, fret: fretNum, pc });
                        presentPitchClasses.add(pc);
                        if (pc === rootIndex) hasRoot = true;
                    }
                }

                if (soundingNotes.length < 3 || !hasRoot) return;

                // Check that all required characteristic intervals are present
                for (let reqPc of requiredPitchClasses) {
                    if (!presentPitchClasses.has(reqPc)) return;
                }

                // Ergonomic check (max span)
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

            // 1. OPEN COWBOY CHORDS (Low-to-High string order: [6th, 5th, 4th, 3rd, 2nd, 1st])
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

            // 2. CAGED / BARRE SCANNER ACROSS ALL ROOTS (Low-to-High order)
            for (let f = 0; f <= 12; f++) {
                // E-form root check on Low E string (index 0)
                if ((openMidiNotes[0] + f) % 12 === rootIndex) {
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const thirdOffset = chordType.includes('m') ? 3 : 4;
                    const eTab = [
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        norm(f + thirdOffset), 
                        f, 
                        f
                    ];
                    evaluateAndPushVoicing(eTab.map(String), "CAGED", `E-Formu Barre (${f}. Perde)`);
                }

                // A-form root check on A string (index 1)
                if ((openMidiNotes[1] + f) % 12 === rootIndex) {
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const thirdOffset = chordType.includes('m') ? 3 : 4;
                    const aTab = [
                        "x", 
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        norm(f + thirdOffset), 
                        f
                    ];
                    evaluateAndPushVoicing(aTab.map(String), "CAGED", `A-Formu Barre (${f}. Perde)`);
                }
            }

            return validVoicings; // Returns empty array if no fully validated match is found instead of deceptive fallbacks
        } catch (err) {
            console.error("generateVoicings error:", err);
            return [];
        }
    }

    getVoicingFrequencies(tabArray) {
        const openMidiNotes = [40, 45, 50, 55, 59, 64]; // Low-to-High string order
        return tabArray.map((fret, stringIdx) => {
            if (fret === "x") return null;
            const fretNum = parseInt(fret);
            const stringInfo = stringTunings[stringIdx];
            return stringInfo.freq * Math.pow(2, fretNum / 12);
        });
    }

    updateChordView() {
        try {
            const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
            
            const posBtnText = document.getElementById("pos-btn-text");
            const chordTitle = document.getElementById("bottom-chord-title");
            const theoryDisplay = document.getElementById("theory-display");

            if (!positions || positions.length === 0) {
                if (posBtnText) posBtnText.innerHTML = `<span style="color:#ff5252;">Bu akor tipi için bu pozisyonda uygun voicing bulunamadı.</span>`;
                if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()}`;
                if (theoryDisplay) theoryDisplay.innerHTML = `<div style="color:#888;">Bu kombinasyon için tanımlı geçerli bir pozisyon yok.</div>`;
                return { currentPos: { tab: ["x","x","x","x","x","x"] }, rootIdx: getNoteIndex(this.currentRoot), intervals: [0, 4, 7] };
            }

            if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
            const currentPos = positions[this.currentPositionIndex] || positions[0];

            const formulaObj = this.chordFormulas[this.currentChordType] || { formula: "R, 3, 5", intervals: [0, 4, 7], construction: "", soundFeel: "" };
            const rootIdx = getNoteIndex(this.currentRoot);
            const constituentNotes = (formulaObj.intervals || [0, 4, 7]).map(i => this.notesList[(rootIdx + i) % 12] || 'C');

            if (posBtnText) {
                posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${this.currentPositionIndex + 1} / ${positions.length})</span>`;
            }

            if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Validated Engine)`;

            if (theoryDisplay) {
                const notesHTML = constituentNotes.map(n => `<span class="note-badge">${n}</span>`).join('');
                theoryDisplay.innerHTML = `
                    <div style="margin-bottom:8px;"><b>Akor Notaları:</b> ${notesHTML}</div>
                    <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${formulaObj.formula}</span></div>
                    <div style="margin-bottom:8px;"><b>Nasıl Kurulur (Yapı):</b> ${formulaObj.construction || ""}</div>
                    <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--alt-color); margin-top:6px;">${formulaObj.soundFeel || ""}</div>
                `;
            }

            return { currentPos, rootIdx, intervals: formulaObj.intervals };
        } catch (err) {
            console.error("updateChordView error:", err);
        }
    }

    buildControls() {
        const rootContainer = this.container.querySelector('#chord-root-buttons');
        if (rootContainer) {
            rootContainer.innerHTML = '';
            this.notesList.forEach(note => {
                const btn = document.createElement('button');
                btn.className = 'ctrl-btn' + (note === this.currentRoot ? ' active' : '');
                btn.textContent = note;
                btn.onclick = () => {
                    this.currentRoot = note;
                    this.currentPositionIndex = 0;
                    rootContainer.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (window.appUpdateView) window.appUpdateView();
                };
                rootContainer.appendChild(btn);
            });
        }

        const qualityContainer = this.container.querySelector('#chord-quality-buttons');
        if (qualityContainer) {
            qualityContainer.innerHTML = '';
            Object.keys(this.chordQualities).forEach(qKey => {
                const btn = document.createElement('button');
                btn.className = 'ctrl-btn' + (qKey === this.currentQuality ? ' active' : '');
                btn.textContent = this.chordQualities[qKey].name;
                btn.onclick = () => {
                    this.currentQuality = qKey;
                    this.currentChordType = this.chordQualities[qKey].types[0];
                    this.currentPositionIndex = 0;
                    
                    qualityContainer.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.buildTypeControls();
                    if (window.appUpdateView) window.appUpdateView();
                };
                qualityContainer.appendChild(btn);
            });
        }

        this.buildTypeControls();
    }

    buildTypeControls() {
        const typeContainer = this.container.querySelector('#chord-type-buttons');
        if (!typeContainer) return;
        typeContainer.innerHTML = '';
        
        const qualityObj = this.chordQualities[this.currentQuality] || this.chordQualities["maj"];
        const allowedTypes = qualityObj.types || ["maj"];
        if (!allowedTypes.includes(this.currentChordType)) {
            this.currentChordType = allowedTypes[0];
        }

        allowedTypes.forEach(typeKey => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (typeKey === this.currentChordType ? ' active' : '');
            btn.textContent = typeKey.toUpperCase();
            btn.onclick = () => {
                this.currentChordType = typeKey;
                this.currentPositionIndex = 0;
                typeContainer.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (window.appUpdateView) window.appUpdateView();
            };
            typeContainer.appendChild(btn);
        });
    }

    attachEventListeners() {
        const posCycleBtn = document.getElementById('position-cycle-btn');
        if (posCycleBtn) {
            posCycleBtn.onclick = () => {
                const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
                if (!positions || positions.length === 0) return;
                this.currentPositionIndex = (this.currentPositionIndex + 1) % positions.length;
                if (window.appUpdateView) window.appUpdateView();
            };
        }

        const playBtn = document.getElementById('play-chord-btn');
        if (playBtn) {
            playBtn.onclick = () => {
                try {
                    const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
                    if (!positions || positions.length === 0) return;
                    if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
                    const currentPos = positions[this.currentPositionIndex] || positions[0];
                    const frequencies = this.getVoicingFrequencies(currentPos.tab);
                    
                    const speedSlider = document.getElementById('speed-slider');
                    const speedMultiplier = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                    const delayStep = 0.115 / speedMultiplier;

                    // Strum direction: Low-to-High string order (6th string down to 1st string)
                    for (let index = 0; index < 6; index++) {
                        const freq = frequencies[index];
                        if (freq) {
                            playTone(freq, index * delayStep, 1.5);
                        }
                    }
                } catch (err) {
                    console.error("Playback error:", err);
                }
            };
        }
    }
}
