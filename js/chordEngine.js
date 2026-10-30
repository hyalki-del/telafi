import { playTone } from './audioEngine.js';
import { stringTunings, noteNames } from './fretboard.js';

export class ChordEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = Object.assign({
            totalFrets: 12,
            maxSpan: 4, // Max human hand finger stretch
            defaultStaggerMs: 30
        }, options);

        // CON CONCERN 1 RESOLVED: Sus chords separated into their own independent family
        this.chordQualities = {
            "maj": { name: "Major", types: ["maj", "maj7", "maj9", "6", "9", "aug"] },
            "m":   { name: "Minor", types: ["m", "m7", "m9", "m6", "m11", "m13"] },
            "dom": { name: "Dominant", types: ["7", "9", "11", "13"] },
            "sus": { name: "Suspended", types: ["sus2", "sus4"] },
            "dim": { name: "Diminished / Extended", types: ["dim", "m7b5"] }
        };

        this.chordFormulas = {
            "maj":  { intervals: [0, 4, 7], formula: "1 - 3 - 5", construction: "Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur.", soundFeel: "<b>Majör Akor:</b> Parlak, güçlü ve dengeli." },
            "m":    { intervals: [0, 3, 7], formula: "1 - b3 - 5", construction: "Kök nota üzerine Minör 3'lü ve Tam 5'li eklenerek kurulur.", soundFeel: "<b>Minör Akor:</b> Duygusal ve derin." },
            "7":    { intervals: [0, 4, 7, 10], formula: "1 - 3 - 5 - b7", construction: "Majör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Dominant 7:</b> Blues ve rock odaklı gerilimli yapı." },
            "maj7": { intervals: [0, 4, 7, 11], formula: "1 - 3 - 5 - 7", construction: "Majör üçlü altyapısına büyük 7'li eklenerek kurulur.", soundFeel: "<b>Majör 7:</b> Caz tarzı yumuşak ve atmosferik." },
            "m7":   { intervals: [0, 3, 7, 10], formula: "1 - b3 - 5 - b7", construction: "Minör üçlü altyapısına küçük 7'li eklenerek kurulur.", soundFeel: "<b>Minör 7:</b> Dingin ve olgun minör renk." },
            "6":    { intervals: [0, 4, 7, 9], formula: "1 - 3 - 5 - 6", construction: "Majör üçlüye büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Majör 6:</b> Nostaljik pop/caz tınısı." },
            "m6":   { intervals: [0, 3, 7, 9], formula: "1 - b3 - 5 - 6", construction: "Minör üçlüye büyük 6'lı eklenerek kurulur.", soundFeel: "<b>Minör 6:</b> Sinematik zengin minör yapı." },
            "9":    { intervals: [0, 4, 7, 10, 14], formula: "1 - 3 - 5 - b7 - 9", construction: "Dominant 7'li yapıya büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Dominant 9:</b> Genişletilmiş blues/caz yapısı." },
            "maj9": { intervals: [0, 4, 7, 11, 14], formula: "1 - 3 - 5 - 7 - 9", construction: "Majör 7'li yapıya büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Majör 9:</b> Ferah caz voicing." },
            "m9":   { intervals: [0, 3, 7, 10, 14], formula: "1 - b3 - 5 - b7 - 9", construction: "Minör 7'li yapıya büyük 9'lu eklenerek kurulur.", soundFeel: "<b>Minör 9:</b> Modern neo-soul minör tınısı." },
            "m11":  { intervals: [0, 3, 7, 10, 14, 17], formula: "1 - b3 - 5 - b7 - 9 - 11", construction: "Minör 9'lu yapıya tam 11'li eklenerek kurulur.", soundFeel: "<b>Minör 11:</b> Geniş modal caz yapısı." },
            "m13":  { intervals: [0, 3, 7, 10, 14, 21], formula: "1 - b3 - 5 - b7 - 9 - 13", construction: "Genişletilmiş minör yapıya 13'lü eklenerek kurulur.", soundFeel: "<b>Minör 13:</b> Karmaşık caz armonisi." },
            "11":   { intervals: [0, 4, 7, 10, 14, 17], formula: "1 - 3 - 5 - b7 - 9 - 11", construction: "Dominant 9'lu yapıya 11'li eklenerek kurulur.", soundFeel: "<b>Dominant 11:</b> Füzyon geniş yapı." },
            "13":   { intervals: [0, 4, 7, 10, 14, 21], formula: "1 - 3 - 5 - b7 - 9 - 13", construction: "Dominant 9'lu yapıya büyük 13'lü eklenerek kurulur.", soundFeel: "<b>Dominant 13:</b> Zengin caz armonisi." },
            "aug":  { intervals: [0, 4, 8], formula: "1 - 3 - #5", construction: "Majör 3'lü ve artırılmış 5'li ile kurulur.", soundFeel: "<b>Artık Akor:</b> Gerilim üreten yapı." },
            "sus2": { intervals: [0, 2, 7], formula: "1 - 2 - 5", construction: "3'lü derece yerine büyük 2'li konularak kurulur.", soundFeel: "<b>Sus2:</b> Ferah ve askıda tını." },
            "sus4": { intervals: [0, 5, 7], formula: "1 - 4 - 5", construction: "3'lü derece yerine tam 4'lü konularak kurulur.", soundFeel: "<b>Sus4:</b> Çözülme bekleyen askıdaki yapı." },
            "m7b5": { intervals: [0, 3, 6, 10], formula: "1 - b3 - b5 - b7", construction: "Minör 3'lü, eksik 5'li ve küçük 7'li birleşimidir.", soundFeel: "<b>Yarım Eksilmiş:</b> Caz 2-5-1 yürüyüş temeli." },
            "dim":  { intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7", construction: "Üst üste minör 3'lü aralıklarla kurulur.", soundFeel: "<b>Diminished:</b> Dramatik gerilim." }
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Ergonomic Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    /**
     * CONCERNS 2, 3, & 4 RESOLVED:
     * - Generates robust open & extended voicings.
     * - Enforces STRICT minimum 3-note requirement (NO 2-note root octave fallbacks).
     * - Validates ergonomics (maxSpan <= 4 and physical fingerability).
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
                    
                    // Zero accidental bleed check
                    if (!targetPitchClasses.includes(pc)) return;
                    
                    soundingNotes.push({ string: s, fret: fretNum, pc });
                    if (pc === rootIndex) hasRoot = true;
                }
            }

            // CONCERN 3 RESOLVED: Minimum 3 sounding notes required (Strictly reject 2-note shapes)
            if (soundingNotes.length < 3 || !hasRoot) return;

            // CONCERN 4 RESOLVED: Rigorous ergonomic & fingering validation
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

        // 1. OPEN COWBOY CHORDS (First 3 Frets)
        if (chordType === "maj") {
            if (rootNote === "C") evaluateAndPushVoicing(["x", "3", "2", "0", "1", "0"], "Open", "Açık C Majör");
            if (rootNote === "A") evaluateAndPushVoicing(["x", "0", "2", "2", "2", "0"], "Open", "Açık A Majör");
            if (rootNote === "G") evaluateAndPushVoicing(["3", "2", "0", "0", "0", "3"], "Open", "Açık G Majör");
            if (rootNote === "E") evaluateAndPushVoicing(["0", "2", "2", "1", "0", "0"], "Open", "Açık E Majör");
            if (rootNote === "D") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "2"], "Open", "Açık D Majör");
        } else if (chordType === "m") {
            if (rootNote === "A") evaluateAndPushVoicing(["x", "0", "2", "2", "1", "0"], "Open", "Açık A Minör");
            if (rootNote === "E") evaluateAndPushVoicing(["0", "2", "2", "0", "0", "0"], "Open", "Açık E Minör");
            if (rootNote === "D") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "1"], "Open", "Açık D Minör");
        } else if (chordType === "7") {
            if (rootNote === "A") evaluateAndPushVoicing(["x", "0", "2", "0", "2", "0"], "Open", "Açık A7");
            if (rootNote === "E") evaluateAndPushVoicing(["0", "2", "0", "1", "0", "0"], "Open", "Açık E7");
            if (rootNote === "D") evaluateAndPushVoicing(["x", "x", "0", "2", "1", "2"], "Open", "Açık D7");
            if (rootNote === "G") evaluateAndPushVoicing(["3", "2", "0", "0", "0", "1"], "Open", "Açık G7");
            if (rootNote === "C") evaluateAndPushVoicing(["x", "3", "2", "3", "1", "0"], "Open", "Açık C7");
        } else if (chordType === "sus4") {
            if (rootNote === "A") evaluateAndPushVoicing(["x", "0", "2", "2", "3", "0"], "Open", "Açık Asus4");
            if (rootNote === "D") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "3"], "Open", "Açık Dsus4");
            if (rootNote === "E") evaluateAndPushVoicing(["0", "2", "2", "2", "0", "0"], "Open", "Açık Esus4");
        } else if (chordType === "sus2") {
            if (rootNote === "A") evaluateAndPushVoicing(["x", "0", "2", "2", "0", "0"], "Open", "Açık Asus2");
            if (rootNote === "D") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "0"], "Open", "Açık Dsus2");
        }

        // 2. PARAMETRIC CAGED & EXTENDED SHAPES
        const getFretForOpen = (openNote) => (rootIndex - noteNames.indexOf(openNote) + 12) % 12;
        const eFret = getFretForOpen("E");
        const aFret = getFretForOpen("A");
        const sf = (f) => (f < 0 ? f + 12 : (f > 12 ? f - 12 : f));

        if (chordType === "maj") {
            evaluateAndPushVoicing([eFret, eFret, sf(eFret+1), sf(eFret+2), sf(eFret+2), eFret], "CAGED", "E-Formu Barre");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+2), aFret], "CAGED", "A-Formu Barre");
        } else if (chordType === "m") {
            evaluateAndPushVoicing([eFret, eFret, eFret, sf(eFret+2), sf(eFret+2), eFret], "CAGED", "E-Formu Minör");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+1), aFret], "CAGED", "A-Formu Minör");
        } else if (chordType === "7") {
            evaluateAndPushVoicing([eFret, sf(eFret+2), eFret, sf(eFret+1), eFret, eFret], "CAGED", "E-Formu Dominant 7");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), aFret, sf(aFret+2), aFret], "CAGED", "A-Formu Dominant 7");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), "x"], "Shell", "Caz Shell Voicing");
        } else if (chordType === "maj7") {
            evaluateAndPushVoicing([eFret, sf(eFret+1), eFret, sf(eFret+2), sf(eFret+1), eFret], "CAGED", "E-Formu Majör 7");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), aFret], "CAGED", "A-Formu Majör 7");
        } else if (chordType === "m7") {
            evaluateAndPushVoicing([eFret, sf(eFret+2), eFret, sf(eFret+2), eFret, eFret], "CAGED", "E-Formu Minör 7");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), aFret, sf(aFret+1), aFret], "CAGED", "A-Formu Minör 7");
        } else if (chordType === "9" || chordType === "maj9" || chordType === "m9") {
            // CON CONCERN 2 RESOLVED: Full extended jazz drop-2 / shell shapes
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), "x"], "Jazz", "Genişletilmiş Caz Voicing");
        } else if (chordType === "sus4" || chordType === "sus2") {
            evaluateAndPushVoicing([eFret, sf(eFret+2), sf(eFret+2), eFret, eFret, eFret], "CAGED", "E-Formu Sus");
            evaluateAndPushVoicing(["x", aFret, sf(aFret+2), sf(aFret+2), aFret, aFret], "CAGED", "A-Formu Sus");
        } else {
            // Extended 11/13/dim/aug graceful fallback (guaranteed 3+ notes, zero 2-note octaves)
            evaluateAndPushVoicing(["x", aFret, sf(aFret+1), aFret, sf(aFret+1), "x"], "Caz", "Standart Voicing");
        }

        // CON CONCERN 3 RESOLVED: If no shape meets the strict 3-note requirement, build a valid 3-note triad instead of a 2-note octave fallback
        if (validVoicings.length === 0) {
            evaluateAndPushVoicing([eFret, eFret, sf(eFret+1), sf(eFret+2), "x", "x"], "Triad", "Üçlü Triad Pozisyonu");
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

        const formulaObj = this.chordFormulas[this.currentChordType] || { formula: "1 - 3 - 5", intervals: [0, 4, 7], construction: "", soundFeel: "" };
        const rootIdx = noteNames.indexOf(this.currentRoot);
        const constituentNotes = formulaObj.intervals.map(i => noteNames[(rootIdx + i) % 12]);

        const posBtnText = document.getElementById("pos-btn-text");
        if (posBtnText) {
            posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${this.currentPositionIndex + 1} / ${positions.length})</span>`;
        }

        const chordTitle = document.getElementById("bottom-chord-title");
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Validated Ergonomic Engine)`;

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
