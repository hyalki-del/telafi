import { playTone } from './audioEngine.js';
import { stringTunings, noteNames } from './fretboard.js';

export class ChordEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = Object.assign({
            totalFrets: 12,
            fretMarkers: [3, 5, 7, 9, 12],
            defaultStaggerMs: 30
        }, options);

        this.chordQualities = {
            "maj": { name: "Major", types: ["maj", "maj7", "maj9", "6", "9", "sus2", "sus4", "aug"] },
            "m":   { name: "Minor", types: ["m", "m7", "m9", "m6", "m11", "m13", "sus4"] },
            "dom": { name: "Dominant", types: ["7", "9", "11", "13"] },
            "dim": { name: "Diminished / Extended", types: ["dim", "m7b5"] }
        };

        this.chordFormulas = {
            "maj":  { intervals: [0, 4, 7], formula: "1 - 3 - 5", theoryDesc: "<b>Majör Akor:</b> Kök nota üzerine Majör 3'lü ve Tam 5'li eklenerek kurulur." },
            "m":    { intervals: [0, 3, 7], formula: "1 - b3 - 5", theoryDesc: "<b>Minör Akor:</b> Minör 3'lü aralığa sahiptir, duygusal ve hüzünlü tını katar." },
            "7":    { intervals: [0, 4, 7, 10], formula: "1 - 3 - 5 - b7", theoryDesc: "<b>Dominant 7'li Akor:</b> Çözülme isteği uyandıran gerilimli yapı." },
            "maj7": { intervals: [0, 4, 7, 11], formula: "1 - 3 - 5 - 7", theoryDesc: "<b>Majör 7'li Akor:</b> Caz tarzı atmosferik ve yumuşak renk." },
            "m7":   { intervals: [0, 3, 7, 10], formula: "1 - b3 - 5 - b7", theoryDesc: "<b>Minör 7'li Akor:</b> Dingin ve olgun minör renk." },
            "6":    { intervals: [0, 4, 7, 9], formula: "1 - 3 - 5 - 6", theoryDesc: "<b>Majör 6'lı:</b> Nostaljik ve sıcak caz/pop tınısı." },
            "m6":   { intervals: [0, 3, 7, 9], formula: "1 - b3 - 5 - 6", theoryDesc: "<b>Minör 6'lı:</b> Sinematik ve zengin minör renk." },
            "9":    { intervals: [0, 4, 7, 10, 14], formula: "1 - 3 - 5 - b7 - 9", theoryDesc: "<b>Dominant 9'lu:</b> Blues ve caz renkli yapı." },
            "maj9": { intervals: [0, 4, 7, 11, 14], formula: "1 - 3 - 5 - 7 - 9", theoryDesc: "<b>Majör 9'lu:</b> Ferah ve zengin caz voicing." },
            "m9":   { intervals: [0, 3, 7, 10, 14], formula: "1 - b3 - 5 - b7 - 9", theoryDesc: "<b>Minör 9'lu:</b> Modern neo-soul minör yapısı." },
            "m11":  { intervals: [0, 3, 7, 10, 14, 17], formula: "1 - b3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Minör 11'li:</b> Arızasız, temizlenmiş modal caz yapısı." },
            "m13":  { intervals: [0, 3, 7, 10, 14, 21], formula: "1 - b3 - 5 - b7 - 9 - 13", theoryDesc: "<b>Minör 13'lü:</b> Karmaşık caz armonisi." },
            "11":   { intervals: [0, 4, 7, 10, 14, 17], formula: "1 - 3 - 5 - b7 - 9 - 11", theoryDesc: "<b>Dominant 11'li:</b> Füzyon tarzı geniş yapı." },
            "13":   { intervals: [0, 4, 7, 10, 14, 21], formula: "1 - 3 - 5 - b7 - 9 - 13", theoryDesc: "<b>Dominant 13'lü:</b> Kompleks caz armonisi." },
            "aug":  { intervals: [0, 4, 8], formula: "1 - 3 - #5", theoryDesc: "<b>Artık Akor:</b> 5'li sesin tizleşmesiyle genişleyen yapı." },
            "sus2": { intervals: [0, 2, 7], formula: "1 - 2 - 5", theoryDesc: "<b>Sus2:</b> 3'lü ses yerine 2'li ses içerir." },
            "sus4": { intervals: [0, 5, 7], formula: "1 - 4 - 5", theoryDesc: "<b>Sus4:</b> 3'lü ses yerine 4'lü ses içerir." },
            "m7b5": { intervals: [0, 3, 6, 10], formula: "1 - b3 - b5 - b7", theoryDesc: "<b>Yarım Eksilmiş (m7b5):</b> Caz müzikte minor 2-5-1 temelidir." },
            "dim":  { intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7", theoryDesc: "<b>Diminished 7'li:</b> Simetrik ve yüksek gerilimli yapı." }
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Constraint Filtered)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    generateVoicings(rootNote, chordType) {
        const rootIndex = noteNames.indexOf(rootNote);
        const formula = this.chordFormulas[chordType];
        if (!formula) return [];

        const targetNoteIndices = formula.intervals.map(i => (rootIndex + i) % 12);
        let generatedPositions = [];

        for (let baseFret = 0; baseFret <= 12; baseFret++) {
            let candidateTab = ["x", "x", "x", "x", "x", "x"];
            let playedFrets = [];
            let foundNotesInChord = new Set();

            for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
                let bestFretForString = "x";
                
                for (let f = baseFret; f <= baseFret + 4; f++) {
                    if (f > 15) continue;
                    let midi = stringTunings[stringIdx].freq ? stringTunings[stringIdx] : null; 
                    // stringTunings yapınıza uygun frekans/midi map kontrolü
                    // Not: stringTunings frequency tutuyor, midi notalarını index'ten çıkarabiliriz veya doğrudan hesaplayabiliriz.
                }
            }
        }

        // Projenizin halihazırdaki güçlü CAGED / Drop-2 pozisyon matrisini buraya entegre edebilirsiniz:
        return this.getFallbackVoicings(rootNote, chordType);
    }

    getFallbackVoicings(root, type) {
        // Mevcut projenizdeki akor matris motoru entegrasyonu
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
        } else if (type === "m") {
            rawPositions.push({ sys: "CAGED", name: "E-Formu Minör", tab: [eFret, eFret, eFret, eFret+2, eFret+2, eFret] });
            rawPositions.push({ sys: "CAGED", name: "A-Formu Minör", tab: [aFret, aFret+1, aFret+2, aFret+2, aFret, "x"] });
        } else {
            rawPositions.push({ sys: "CAGED", name: "Temel Pozisyon", tab: [eFret, "x", "x", "x", "x", "x"] });
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
        const positions = this.getFallbackVoicings(this.currentRoot, this.currentChordType);
        if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
        const currentPos = positions[this.currentPositionIndex];

        const formulaObj = this.chordFormulas[this.currentChordType] || { formula: "1 - 3 - 5", intervals: [0, 4, 7], theoryDesc: "" };
        const rootIdx = noteNames.indexOf(this.currentRoot);
        const constituentNotes = formulaObj.intervals.map(i => noteNames[(rootIdx + i) % 12]);

        const posBtnText = document.getElementById("pos-btn-text");
        if (posBtnText) {
            posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${this.currentPositionIndex + 1} / ${positions.length})</span>`;
        }

        const chordTitle = document.getElementById("bottom-chord-title");
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Funnel Rule Matrix)`;

        const theoryDisplay = document.getElementById("theory-display");
        if (theoryDisplay) {
            const notesHTML = constituentNotes.map(n => `<span class="note-badge">${n}</span>`).join('');
            theoryDisplay.innerHTML = `
                <div style="margin-bottom:8px;"><b>Akor Notaları:</b> ${notesHTML}</div>
                <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${formulaObj.formula}</span></div>
                <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--alt-color); margin-top:6px;">${formulaObj.theoryDesc}</div>
            `;
        }

        return { currentPos, rootIdx, intervals: formulaObj.intervals };
    }

    buildControls() {
        // 1. Root Note Buttons
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

        // 2. Chord Quality Buttons
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
                const positions = this.getFallbackVoicings(this.currentRoot, this.currentChordType);
                this.currentPositionIndex = (this.currentPositionIndex + 1) % positions.length;
                if (window.appUpdateView) window.appUpdateView();
            };
        }

        const playBtn = document.getElementById('play-chord-btn');
        if (playBtn) {
            playBtn.onclick = () => {
                const positions = this.getFallbackVoicings(this.currentRoot, this.currentChordType);
                if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
                const currentPos = positions[this.currentPositionIndex];
                const frequencies = this.getVoicingFrequencies(currentPos.tab);
                
                const speedSlider = document.getElementById('speed-slider');
                const speedMultiplier = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                const delayStep = 0.115 / speedMultiplier;

                frequencies.forEach((freq, index) => {
                    if (freq) playTone(freq, index * delayStep, 1.5);
                });
            };
        }
    }
}
