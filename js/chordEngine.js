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

        // Standardized Chord Families aligned with the Chord Book definitions
        this.chordQualities = {
            "maj": { name: "Major", types: ["maj", "maj7", "6", "sus2", "sus4", "add9"] },
            "dom": { name: "Dominant", types: ["7", "7sus4", "7b5", "7sharp5", "9", "11", "13"] },
            "m":   { name: "Minor", types: ["m", "m6", "m7", "m7b5", "m9", "m11", "m13", "mMaj7"] },
            "aug": { name: "Augmented", types: ["aug", "aug7"] },
            "dim": { name: "Diminished", types: ["dim", "dim7"] }
        };

        // Standardized Formula Map aligned directly with the textbook reference chart
        this.chordFormulas = {
            "maj":      { intervals: [0, 4, 7], formula: "R, 3, 5", construction: "Kök nota üzerine Majör 3'lü (4 yarı ses) ve Tam 5'li (7 yarı ses) eklenerek kurulur.", soundFeel: "<b>Majör Akor:</b> Parlak, güçlü ve açık temel yapı." },
            "maj7":     { intervals: [0, 4, 7, 11], formula: "R, 3, 5, 7", construction: "Majör üçlü altyapısına büyük 7'li eklenerek kurulur.", soundFeel: "<b>Majör 7'li:</b> Caz tarzı yumuşak ve atmosferik tını." },
            "6":        { intervals: [0, 4, 7, 9], formula: "R, 3, 6, 5", construction: "Majör üçlü altyapısına büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Majör 6'lı:</b> Nostaljik pop/caz yapısı." },
            "sus2":     { intervals: [0, 2, 7], formula: "R, 2, 5", construction: "3'lü derece yerine büyük 2'li konularak kurulur.", soundFeel: "<b>Sus2:</b> Askıda kalmış ferah tını." },
            "sus4":     { intervals: [0, 5, 7], formula: "R, 4, 5", construction: "3'lü derece yerine tam 4'lü konularak kurulur.", soundFeel: "<b>Sus4:</b> Çözülme isteyen askıdaki yapı." },
            "add9":     { intervals: [0, 4, 7, 14], formula: "R, 2, 3, 5", construction: "Majör üçlüğe 9'lu (2. derece) eklenerek kurulur.", soundFeel: "<b>Add9:</b> Parlak ve modern pop akoru." },
            
            "7":        { intervals: [0, 4, 7, 10], formula: "R, 3, 5, b7", construction: "Majör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Dominant 7:</b> Blues ve rock odaklı gerilimli yapı." },
            "7sus4":    { intervals: [0, 5, 7, 10], formula: "R, 4, 5, b7", construction: "Sus4 yapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>7sus4:</b> Modern funk ve fusion akoru." },
            "7b5":      { intervals: [0, 4, 6, 10], formula: "R, 3, b5, b7", construction: "Dominant 7 akorunun 5'lisinin bellenmesiyle kurulur.", soundFeel: "<b>7b5:</b> Caz ve blues içinde renkli gerilim." },
            "7sharp5":  { intervals: [0, 4, 8, 10], formula: "R, 3, #5, b7", construction: "Dominant 7 akorunun 5'lisinin artırılmasıyla kurulur.", soundFeel: "<b>7#5:</b> Altered dominant gerilimi." },
            "9":        { intervals: [0, 4, 7, 10, 14], formula: "R, 3, 5, b7, 9", construction: "Dominant 7 akoruna büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Dominant 9:</b> Zengin blues/caz armonisi." },
            "11":       { intervals: [0, 7, 10, 14, 17], formula: "R, 5, b7, 9, 11", construction: "Genişletilmiş dominant yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Dominant 11:</b> Geniş füzyon yapısı." },
            "13":       { intervals: [0, 4, 7, 10, 14, 21], formula: "R, 3, 5, b7, 9, 13", construction: "Dominant yapıya 13'lü derece eklenerek kurulur.", soundFeel: "<b>Dominant 13:</b> Tam kapsamlı caz akoru." },

            "m":        { intervals: [0, 3, 7], formula: "R, b3, 5", construction: "Kök nota üzerine minör 3'lü ve tam 5'li eklenerek kurulur.", soundFeel: "<b>Minör Akor:</b> Duygusal ve derin hüzünlü tını." },
            "m6":       { intervals: [0, 3, 7, 9], formula: "R, b3, 6, 5", construction: "Minör üçlüye büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Minör 6'lı:</b> Sinematik zengin minör renk." },
            "m7":       { intervals: [0, 3, 7, 10], formula: "R, b3, 5, b7", construction: "Minör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Minör 7'li:</b> Dingin ve olgun minör akor." },
            "m7b5":     { intervals: [0, 3, 6, 10], formula: "R, b3, b5, b7", construction: "Yarım eksilmiş akor; minör 3, b5 ve b7 birleşimidir.", soundFeel: "<b>Yarım Eksilmiş (m7b5):</b> Caz 2-5-1 yürüyüş temeli." },
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
        this.renderLayout();
        this.buildControls();
        this.updateChordView();
        this.attachEventListeners();
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Textbook Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    /**
     * TEXTBOOK-ALIGNED PARAMETRIC VOICING GENERATOR
     * Fully supports all 12 roots (including sharps/flats like D#, F#, Bb)
     * Enforces strict 3+ note minimum and ergonomic finger stretches (<= 4 frets).
     */
    generateVoicings(rootNote, chordType) {
        const rootIndex = noteNames.indexOf(rootNote);
        const formulaObj = this.chordFormulas[chordType] || this.chordFormulas["maj"];
        const targetIntervals = formulaObj.intervals;
        const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
        
        const openMidiNotes = [64, 59, 55, 50, 45, 40]; // High E (0) to Low E (5)
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
                    
                    // Zero accidental bleed check: Note MUST belong to formula
                    if (!targetPitchClasses.includes(pc)) return;
                    
                    soundingNotes.push({ string: s, fret: fretNum, pc });
                    if (pc === rootIndex) hasRoot = true;
                }
            }

            // Must have at least 3 sounding strings and must contain root
            if (soundingNotes.length < 3 || !hasRoot) return;

            // Ergonomic fret span validation (<= 4 frets)
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

        const getFretForOpen = (openNote) => (rootIndex - noteNames.indexOf(openNote) + 12) % 12;
        const sf = (f) => (f < 0 ? f + 12 : (f > 12 ? f - 12 : f));

        // 1. PROFESSIONAL OPEN COWBOY CHORDS (Accurate ergonomic shapes like A major = x-0-2-2-2-0)
        if (rootNote === "A" && chordType === "maj") evaluateAndPushVoicing(["x", "0", "2", "2", "2", "0"], "Open", "Açık A Majör");
        if (rootNote === "A" && chordType === "m")   evaluateAndPushVoicing(["x", "0", "2", "2", "1", "0"], "Open", "Açık A Minör");
        if (rootNote === "A" && chordType === "7")   evaluateAndPushVoicing(["x", "0", "2", "0", "2", "0"], "Open", "Açık A7");
        if (rootNote === "A" && chordType === "maj7") evaluateAndPushVoicing(["x", "0", "2", "1", "2", "0"], "Open", "Açık Amaj7");
        if (rootNote === "A" && chordType === "sus4") evaluateAndPushVoicing(["x", "0", "2", "2", "3", "0"], "Open", "Açık Asus4");
        if (rootNote === "A" && chordType === "sus2") evaluateAndPushVoicing(["x", "0", "2", "2", "0", "0"], "Open", "Açık Asus2");

        if (rootNote === "C" && chordType === "maj") evaluateAndPushVoicing(["x", "3", "2", "0", "1", "0"], "Open", "Açık C Majör");
        if (rootNote === "C" && chordType === "maj7") evaluateAndPushVoicing(["x", "3", "2", "0", "0", "0"], "Open", "Açık Cmaj7");
        if (rootNote === "C" && chordType === "7")   evaluateAndPushVoicing(["x", "3", "2", "3", "1", "0"], "Open", "Açık C7");

        if (rootNote === "G" && chordType === "maj") evaluateAndPushVoicing(["3", "2", "0", "0", "0", "3"], "Open", "Açık G Majör");
        if (rootNote === "G" && chordType === "7")   evaluateAndPushVoicing(["3", "2", "0", "0", "0", "1"], "Open", "Açık G7");

        if (rootNote === "E" && chordType === "maj") evaluateAndPushVoicing(["0", "2", "2", "1", "0", "0"], "Open", "Açık E Majör");
        if (rootNote === "E" && chordType === "m")   evaluateAndPushVoicing(["0", "2", "2", "0", "0", "0"], "Open", "Açık E Minör");
        if (rootNote === "E" && chordType === "7")   evaluateAndPushVoicing(["0", "2", "0", "1", "0", "0"], "Open", "Açık E7");
        if (rootNote === "E" && chordType === "m7")  evaluateAndPushVoicing(["0", "2", "2", "0", "3", "0"], "Open", "Açık Em7");

        if (rootNote === "D" && chordType === "maj") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "2"], "Open", "Açık D Majör");
        if (rootNote === "D" && chordType === "m")   evaluateAndPushVoicing(["x", "x", "0", "2", "3", "1"], "Open", "Açık D Minör");
        if (rootNote === "D" && chordType === "7")   evaluateAndPushVoicing(["x", "x", "0", "2", "1", "2"], "Open", "Açık D7");
        if (rootNote === "D" && chordType === "m7")  evaluateAndPushVoicing(["x", "x", "0", "2", "1", "1"], "Open", "Açık Dm7");
        if (rootNote === "D" && chordType === "sus4") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "3"], "Open", "Açık Dsus4");

        // 2. PARAMETRIC CAGED & BARRE SHAPES ACROSS ALL 12 ROOTS
        const openMidiNotes = [64, 59, 55, 50, 45, 40];
        for (let f = 0; f <= 12; f++) {
            // E-form root alignment
            if ((openMidiNotes[5] + f) % 12 === rootIndex) {
                if (chordType === "maj") evaluateAndPushVoicing([f, f, sf(f+1), sf(f+2), sf(f+2), f], "CAGED", `E-Formu Barre (${f}. Perde)`);
                if (chordType === "m")   evaluateAndPushVoicing([f, f, f, sf(f+2), sf(f+2), f], "CAGED", `E-Formu Minör (${f}. Perde)`);
                if (chordType === "7")   evaluateAndPushVoicing([f, sf(f+2), f, sf(f+1), f, f], "CAGED", `E-Formu 7 (${f}. Perde)`);
                if (chordType === "maj7") evaluateAndPushVoicing([f, sf(f+1), f, sf(f+2), sf(f+1), f], "CAGED", `E-Formu Maj7 (${f}. Perde)`);
                if (chordType === "m7")   evaluateAndPushVoicing([f, sf(f+2), f, sf(f+2), f, f], "CAGED", `E-Formu m7 (${f}. Perde)`);
                if (chordType === "sus4") evaluateAndPushVoicing([f, sf(f+3), sf(f+3), f, f, f], "CAGED", `E-Formu Sus4 (${f}. Perde)`);
                if (chordType === "sus2") evaluateAndPushVoicing([f, sf(f+2), sf(f+2), f, f, f], "CAGED", `E-Formu Sus2 (${f}. Perde)`);
            }

            // A-form root alignment
            if ((openMidiNotes[4] + f) % 12 === rootIndex) {
                if (chordType === "maj") evaluateAndPushVoicing(["x", f, sf(f+2), sf(f+2), sf(f+2), f], "CAGED", `A-Formu Barre (${f}. Perde)`);
                if (chordType === "m")   evaluateAndPushVoicing(["x", f, sf(f+2), sf(f+2), sf(f+1), f], "CAGED", `A-Formu Minör (${f}. Perde)`);
                if (chordType === "7")   evaluateAndPushVoicing(["x", f, sf(f+2), f, sf(f+2), f], "CAGED", `A-Formu 7 (${f}. Perde)`);
                if (chordType === "maj7") evaluateAndPushVoicing(["x", f, sf(f+2), sf(f+1), sf(f+2), f], "CAGED", `A-Formu Maj7 (${f}. Perde)`);
                if (chordType === "m7")   evaluateAndPushVoicing(["x", f, sf(f+2), f, sf(f+1), f], "CAGED", `A-Formu m7 (${f}. Perde)`);
                if (chordType === "9" || chordType === "maj9" || chordType === "m9") evaluateAndPushVoicing(["x", f, sf(f+1), f, sf(f+2), "x"], "Jazz", `Caz Voicing (${f}. Perde)`);
            }
        }

        // Guaranteed fallback safety shape (3+ notes valid triad)
        if (validVoicings.length === 0) {
            const safeFret = (rootIndex - (40 % 12) + 12) % 12;
            evaluateAndPushVoicing([safeFret, safeFret, sf(safeFret+1), sf(safeFret+2), "x", "x"], "Triad", "Standart Triad Pozisyonu");
        }

        return validVoicings;
    }

    getVoicingFrequencies(tabArray) {
        const openMidiNotes = [64, 59, 55, 50, 45, 40];
        return tabArray.map((fret, stringIdx) => {
            if (fret === "x") return null;
            const fretNum = parseInt(fret);
            const stringInfo = stringTunings[stringIdx];
            return stringInfo.freq * Math.pow(2, fretNum / 12);
        });
    }

    updateChordView() {
        const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
        if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
        const currentPos = positions[this.currentPositionIndex] || positions[0];

        const formulaObj = this.chordFormulas[this.currentChordType] || { formula: "R, 3, 5", intervals: [0, 4, 7], construction: "", soundFeel: "" };
        const rootIdx = noteNames.indexOf(this.currentRoot);
        const constituentNotes = formulaObj.intervals.map(i => noteNames[(rootIdx + i) % 12]);

        const posBtnText = document.getElementById("pos-btn-text");
        if (posBtnText) {
            posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${this.currentPositionIndex + 1} / ${positions.length})</span>`;
        }

        const chordTitle = document.getElementById("bottom-chord-title");
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Textbook Engine)`;

        const theoryDisplay = document.getElementById("theory-display");
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
    }

    buildControls() {
        const rootContainer = this.container.querySelector('#chord-root-buttons');
        if (rootContainer) {
            rootContainer.innerHTML = '';
            noteNames.forEach(note => {
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
        
        const allowedTypes = this.chordQualities[this.currentQuality].types;
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
                this.currentPositionIndex = (this.currentPositionIndex + 1) % positions.length;
                if (window.appUpdateView) window.appUpdateView();
            };
        }

        const playBtn = document.getElementById('play-chord-btn');
        if (playBtn) {
            playBtn.onclick = () => {
                try {
                    const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
                    if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
                    const currentPos = positions[this.currentPositionIndex] || positions[0];
                    const frequencies = this.getVoicingFrequencies(currentPos.tab);
                    
                    const speedSlider = document.getElementById('speed-slider');
                    const speedMultiplier = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                    const delayStep = 0.115 / speedMultiplier;

                    for (let index = 5; index >= 0; index--) {
                        const freq = frequencies[index];
                        if (freq) {
                            const stepOrder = 5 - index;
                            playTone(freq, stepOrder * delayStep, 1.5);
                        }
                    }
                } catch (err) {
                    console.error("Playback error:", err);
                }
            };
        }
    }
}
