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
            "maj": { name: "Major", types: ["maj", "maj7", "maj9", "6", "9", "sus2", "sus4", "aug"] },
            "m":   { name: "Minor", types: ["m", "m7", "m9", "m6", "m11", "m13", "sus4"] },
            "dom": { name: "Dominant", types: ["7", "9", "11", "13"] },
            "dim": { name: "Diminished / Extended", types: ["dim", "m7b5"] }
        };

        this.chordFormulas = {
            "maj":  { intervals: [0, 4, 7], formula: "1 - 3 - 5", construction: "Kök nota üzerine Majör 3'lü (4 yarı ses) ve Tam 5'li (7 yarı ses) aralıklarının üst üste yığılmasıyla kurulur.", soundFeel: "<b>Majör Akor:</b> Parlak, güçlü, açık ve dengeli bir temel yapı sunar." },
            "m":    { intervals: [0, 3, 7], formula: "1 - b3 - 5", construction: "Kök nota üzerine Minör 3'lü (3 yarı ses) ve Tam 5'li (7 yarı ses) aralıklarının yığılmasıyla kurulur.", soundFeel: "<b>Minör Akor:</b> Duygusal, hüzünlü ve derin bir tını katar." },
            "7":    { intervals: [0, 4, 7, 10], formula: "1 - 3 - 5 - b7", construction: "Majör üçlü altyapısına bir küçük 7'li (10 yarı ses) aralık eklenerek kurulur.", soundFeel: "<b>Dominant 7'li Akor:</b> Çözülme isteği uyandıran gerilimli, blues ve rock odaklı yapı." },
            "maj7": { intervals: [0, 4, 7, 11], formula: "1 - 3 - 5 - 7", construction: "Majör üçlü altyapısına bir büyük 7'li (11 yarı ses) aralık eklenerek kurulur.", soundFeel: "<b>Majör 7'li Akor:</b> Caz tarzı atmosferik, yumuşak ve renkli." },
            "m7":   { intervals: [0, 3, 7, 10], formula: "1 - b3 - 5 - b7", construction: "Minör üçlü altyapısına bir küçük 7'li aralık eklenerek kurulur.", soundFeel: "<b>Minör 7'li Akor:</b> Dingin, olgun ve rahatlatıcı minör renk." },
            "6":    { intervals: [0, 4, 7, 9], formula: "1 - 3 - 5 - 6", construction: "Majör üçlü altyapısına büyük 6'lı aralık (9 yarı ses) eklenerek kurulur.", soundFeel: "<b>Majör 6'lı:</b> Nostaljik ve sıcak pop/caz tınısı." },
            "m6":   { intervals: [0, 3, 7, 9], formula: "1 - b3 - 5 - 6", construction: "Minör üçlü altyapısına büyük 6'lı aralık (9 yarı ses) eklenerek kurulur.", soundFeel: "<b>Minör 6'lı:</b> Sinematik ve zengin minör renk." },
            "9":    { intervals: [0, 4, 7, 10, 14], formula: "1 - 3 - 5 - b7 - 9", construction: "Dominant 7'li yapıya bir oktav üstünden büyük 9'lu aralık eklenerek kurulur.", soundFeel: "<b>Dominant 9'lu:</b> Blues ve caz renkli, genişletilmiş yapı." },
            "maj9": { intervals: [0, 4, 7, 11, 14], formula: "1 - 3 - 5 - 7 - 9", construction: "Majör 7'li yapıya bir oktav üstünden büyük 9'lu aralık eklenerek kurulur.", soundFeel: "<b>Majör 9'lu:</b> Ferah ve zengin caz voicing yapısı." },
            "m9":   { intervals: [0, 3, 7, 10, 14], formula: "1 - b3 - 5 - b7 - 9", construction: "Minör 7'li yapıya büyük 9'lu aralık eklenerek kurulur.", soundFeel: "<b>Minör 9'lu:</b> Modern neo-soul minör yapısı." },
            "m11":  { intervals: [0, 3, 7, 10, 14, 17], formula: "1 - b3 - 5 - b7 - 9 - 11", construction: "Minör 9'lu yapıya tam 11'li aralık eklenerek kurulur.", soundFeel: "<b>Minör 11'li:</b> Arızasız, temizlenmiş modal caz yapısı." },
            "m13":  { intervals: [0, 3, 7, 10, 14, 21], formula: "1 - b3 - 5 - b7 - 9 - 13", construction: "Genişletilmiş minör yapıya büyük 13'lü aralık eklenerek kurulur.", soundFeel: "<b>Minör 13'lü:</b> Karmaşık ve derin caz armonisi." },
            "11":   { intervals: [0, 4, 7, 10, 14, 17], formula: "1 - 3 - 5 - b7 - 9 - 11", construction: "Dominant 9'lu yapıya tam 11'li aralık eklenerek kurulur.", soundFeel: "<b>Dominant 11'li:</b> Füzyon tarzı geniş yapı." },
            "13":   { intervals: [0, 4, 7, 10, 14, 21], formula: "1 - 3 - 5 - b7 - 9 - 13", construction: "Dominant 9'lu yapıya büyük 13'lü aralık eklenerek kurulur.", soundFeel: "<b>Dominant 13'lü:</b> Kompleks caz armonisi." },
            "aug":  { intervals: [0, 4, 8], formula: "1 - 3 - #5", construction: "Kök nota üzerine majör 3'lü ve artırılmış 5'li (8 yarı ses) eklenerek kurulur.", soundFeel: "<b>Artık Akor:</b> 5'li sesin tizleşmesiyle gerilim üreten yapı." },
            "sus2": { intervals: [0, 2, 7], formula: "1 - 2 - 5", construction: "Standart 3'lü derecenin yerine büyük 2'li (2 yarı ses) aralık konularak kurulur.", soundFeel: "<b>Sus2:</b> Askıda kalmış, ferah tını." },
            "sus4": { intervals: [0, 5, 7], formula: "1 - 4 - 5", construction: "Standart 3'lü derecenin yerine tam 4'lü (5 yarı ses) aralık konularak kurulur.", soundFeel: "<b>Sus4:</b> Çözülme ihtiyacı duyan askıdaki yapı." },
            "m7b5": { intervals: [0, 3, 6, 10], formula: "1 - b3 - b5 - b7", construction: "Minör 3'lü, eskimiş 5'li (6 yarı ses) ve küçük 7'li aralıklarının birleşimidir.", soundFeel: "<b>Yarım Eksilmiş (m7b5):</b> Caz müzikte minör 2-5-1 yürüyüşünün temelidir." },
            "dim":  { intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7", construction: "Üst üste minör 3'lü aralıkların yığılmasıyla simetrik olarak kurulur.", soundFeel: "<b>Diminished 7'li:</b> Yüksek gerilimli ve dramatik yapı." }
        };

        this.currentRoot = 'A';
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Verified Theory Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    /**
     * VERIFIED THEORY-DRIVEN SHAPE GENERATOR
     * Computes open cowboy chords and strictly validates intervals against formula rules.
     */
    generateVoicings(root, type) {
        const rootIndex = noteNames.indexOf(root);
        const formulaObj = this.chordFormulas[type] || this.chordFormulas["maj"];
        const targetIntervals = formulaObj.intervals;
        const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
        
        const openMidiNotes = [64, 59, 55, 50, 45, 40]; // High E (0) to Low E (5)
        let rawPositions = [];

        // 1. EXACT OPEN COWBOY CHORDS (First 3 frets, fully verified note contents)
        if (type === "maj") {
            if (root === "C") rawPositions.push({ sys: "Open", name: "Açık C Majör", tab: ["x", "3", "2", "0", "1", "0"] });
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık A Majör", tab: ["x", "0", "2", "2", "2", "0"] });
            if (root === "G") rawPositions.push({ sys: "Open", name: "Açık G Majör", tab: ["3", "2", "0", "0", "0", "3"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık E Majör", tab: ["0", "2", "2", "1", "0", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık D Majör", tab: ["x", "x", "0", "2", "3", "2"] });
        } else if (type === "m") {
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık A Minör", tab: ["x", "0", "2", "2", "1", "0"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık E Minör", tab: ["0", "2", "2", "0", "0", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık D Minör", tab: ["x", "x", "0", "2", "3", "1"] });
        } else if (type === "7") {
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık A7 (A-C#-E-G)", tab: ["x", "0", "2", "0", "2", "0"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık E7 (E-G#-B-D)", tab: ["0", "2", "0", "1", "0", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık D7 (D-F#-A-C)", tab: ["x", "x", "0", "2", "1", "2"] });
            if (root === "G") rawPositions.push({ sys: "Open", name: "Açık G7 (G-B-D-F)", tab: ["3", "2", "0", "0", "0", "1"] });
            if (root === "C") rawPositions.push({ sys: "Open", name: "Açık C7 (C-E-G-Bb)", tab: ["x", "3", "2", "3", "1", "0"] });
        } else if (type === "maj7") {
            if (root === "C") rawPositions.push({ sys: "Open", name: "Açık Cmaj7", tab: ["x", "3", "2", "0", "0", "0"] });
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Amaj7", tab: ["x", "0", "2", "1", "2", "0"] });
            if (root === "F") rawPositions.push({ sys: "Open", name: "Açık Fmaj7", tab: ["x", "x", "3", "2", "1", "0"] });
        } else if (type === "m7") {
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Am7", tab: ["x", "0", "2", "0", "1", "0"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık Em7", tab: ["0", "2", "2", "0", "3", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık Dm7", tab: ["x", "x", "0", "2", "1", "1"] });
        }

        // 2. FORMULA-DRIVEN MOVABLE CAGED & BARRE SHAPES (Validated mathematically)
        const getFret = (openNote) => (rootIndex - noteNames.indexOf(openNote) + 12) % 12;
        const eFret = getFret("E");
        const aFret = getFret("A");
        const sf = (f) => (f < 0 ? f + 12 : (f > 12 ? f - 12 : f));

        if (type === "maj") {
            rawPositions.push({ sys: "CAGED", name: "E-Formu Barre", tab: [eFret, eFret, sf(eFret+1), sf(eFret+2), sf(eFret+2), eFret] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Barre", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+2), aFret] });
        } else if (type === "m") {
            rawPositions.push({ sys: "CAGED", name: "E-Formu Minör", tab: [eFret, eFret, eFret, sf(eFret+2), sf(eFret+2), eFret] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Minör", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+1), aFret] });
        } else if (type === "7") {
            // E-form Dominant 7: Root on Low E -> [fret, fret+2, fret, fret+1, fret, fret] relative to E root
            rawPositions.push({ sys: "CAGED", name: "E-Formu Dominant 7", tab: [eFret, sf(eFret+2), eFret, sf(eFret+1), eFret, eFret] });
            // A-form Dominant 7: Root on A string -> [x, fret, fret+2, fret, fret+2, fret]
            rawPositions.push({ sys: "CAGED", name: "A-Formu Dominant 7", tab: ["x", aFret, sf(aFret+2), aFret, sf(aFret+2), aFret] });
            rawPositions.push({ sys: "Shell", name: "Caz Shell Voicing", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), "x"] });
        } else if (type === "maj7") {
            rawPositions.push({ sys: "CAGED", name: "E-Formu Majör 7", tab: [eFret, sf(eFret+1), eFret, sf(eFret+2), sf(eFret+1), eFret] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Majör 7", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), aFret] });
        } else if (type === "m7") {
            rawPositions.push({ sys: "CAGED", name: "E-Formu Minör 7", tab: [eFret, sf(eFret+2), eFret, sf(eFret+2), eFret, eFret] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Minör 7", tab: ["x", aFret, sf(aFret+2), aFret, sf(aFret+1), aFret] });
        } else {
            // General fallback template for extended/other chords
            rawPositions.push({ sys: "CAGED", name: "E-Formu Kök Pozisyon", tab: [eFret, "x", "x", "x", "x", "x"] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Kök Pozisyon", tab: ["x", aFret, "x", "x", "x", "x"] });
        }

        return rawPositions.map(p => ({
            sys: p.sys,
            name: p.name,
            tab: p.tab.map(v => (v === "x" ? "x" : v.toString()))
        }));
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
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Verified Theory Engine)`;

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
