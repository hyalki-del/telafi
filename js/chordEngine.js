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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (CAGED & Open Shapes)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    /**
     * FORMULAIC CAGED & OPEN POSITION SHAPE GENERATOR
     * Automatically injects open-position shapes (frets 0-3) when matching root,
     * and generates parametric CAGED / Shell shapes across the fretboard.
     */
    generateVoicings(root, type) {
        const rootIndex = noteNames.indexOf(root);
        const getFret = (openNote) => (rootIndex - noteNames.indexOf(openNote) + 12) % 12;
        
        const eFret = getFret("E");
        const aFret = getFret("A");
        const dFret = getFret("D");

        const sf = (f) => {
            while (f < 0) f += 12;
            while (f > 12) f -= 12;
            return f;
        };

        let rawPositions = [];

        // 1. OPEN POSITION SPECIFIC SHAPES (First 3 Frets) when root matches natural open chords
        if (type === "maj") {
            if (root === "C") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open C)", tab: ["x", "3", "2", "0", "1", "0"] });
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open A)", tab: ["x", "0", "2", "2", "2", "0"] });
            if (root === "G") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open G)", tab: ["3", "2", "0", "0", "0", "3"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open E)", tab: ["0", "2", "2", "1", "0", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open D)", tab: ["x", "x", "0", "2", "3", "2"] });
        } else if (type === "m") {
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Am)", tab: ["x", "0", "2", "2", "1", "0"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Em)", tab: ["0", "2", "2", "0", "0", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Dm)", tab: ["x", "x", "0", "2", "3", "1"] });
        } else if (type === "7") {
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open E7)", tab: ["0", "2", "0", "1", "0", "0"] });
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open A7)", tab: ["x", "0", "2", "0", "2", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open D7)", tab: ["x", "x", "0", "2", "1", "2"] });
            if (root === "G") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open G7)", tab: ["3", "2", "0", "0", "0", "1"] });
        } else if (type === "maj7") {
            if (root === "C") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Cmaj7)", tab: ["x", "3", "2", "0", "0", "0"] });
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Amaj7)", tab: ["x", "0", "2", "1", "2", "0"] });
            if (root === "F") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Fmaj7)", tab: ["x", "x", "3", "2", "1", "0"] });
        } else if (type === "m7") {
            if (root === "A") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Am7)", tab: ["x", "0", "2", "0", "1", "0"] });
            if (root === "E") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Em7)", tab: ["0", "2", "2", "0", "3", "0"] });
            if (root === "D") rawPositions.push({ sys: "Open", name: "Açık Pozisyon (Open Dm7)", tab: ["x", "x", "0", "2", "1", "1"] });
        }

        // 2. CAGED & MOVABLE ERGONOMIC TEMPLATES
        switch (type) {
            case "maj":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Barre", tab: [eFret, eFret, sf(eFret+1), sf(eFret+2), sf(eFret+2), eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Barre", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+2), aFret] });
                rawPositions.push({ sys: "Triad", name: "Üst 3 Tel Triad", tab: ["x", "x", "x", dFret, sf(dFret+2), sf(dFret+4)] });
                break;
            case "m":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Minör", tab: [eFret, eFret, eFret, sf(eFret+2), sf(eFret+2), eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Minör", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+1), aFret] });
                rawPositions.push({ sys: "Triad", name: "Üst 3 Tel Minör Triad", tab: ["x", "x", "x", dFret, sf(dFret+2), sf(dFret+3)] });
                break;
            case "7":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Dominant 7", tab: [eFret, sf(eFret+2), eFret, sf(eFret+1), eFret, eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Dominant 7", tab: ["x", aFret, sf(aFret+2), aFret, sf(aFret+2), aFret] });
                rawPositions.push({ sys: "Shell", name: "Caz Shell Voicing", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), "x"] });
                break;
            case "maj7":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Majör 7", tab: [eFret, sf(eFret+1), eFret, sf(eFret+2), sf(eFret+1), eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Majör 7", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), aFret] });
                break;
            case "m7":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Minör 7", tab: [eFret, sf(eFret+2), eFret, sf(eFret+2), eFret, eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Minör 7", tab: ["x", aFret, sf(aFret+2), aFret, sf(aFret+1), aFret] });
                break;
            case "6":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Majör 6", tab: [eFret, sf(eFret+2), sf(eFret+2), sf(eFret+1), eFret, eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Majör 6", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), aFret] });
                break;
            case "m6":
                rawPositions.push({ sys: "Jazz", name: "Minör 6 Voicing", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), sf(aFret+1), "x"] });
                rawPositions.push({ sys: "CAGED", name: "E-Formu Minör 6", tab: [eFret, sf(eFret+2), eFret, sf(eFret+2), sf(eFret+1), eFret] });
                break;
            case "9":
                rawPositions.push({ sys: "Jazz", name: "Dominant 9 Voicing", tab: ["x", aFret, sf(aFret+1), aFret, sf(aFret+2), "x"] });
                break;
            case "maj9":
                rawPositions.push({ sys: "Jazz", name: "Majör 9 Voicing", tab: ["x", aFret, sf(aFret+1), sf(aFret+1), sf(aFret+2), "x"] });
                break;
            case "m9":
                rawPositions.push({ sys: "Jazz", name: "Minör 9 Voicing", tab: ["x", aFret, sf(aFret+1), sf(aFret+1), sf(aFret+1), "x"] });
                break;
            case "sus2":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Sus2", tab: [eFret, sf(eFret+2), sf(eFret+2), eFret, eFret, eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Sus2", tab: ["x", aFret, sf(aFret+2), sf(aFret+2), aFret, aFret] });
                break;
            case "sus4":
                rawPositions.push({ sys: "CAGED", name: "E-Formu Sus4", tab: [eFret, sf(eFret+3), sf(eFret+3), eFret, eFret, eFret] });
                rawPositions.push({ sys: "CAGED", name: "A-Formu Sus4", tab: ["x", aFret, sf(aFret+3), sf(aFret+3), aFret, aFret] });
                break;
            case "dim":
                rawPositions.push({ sys: "Simetrik", name: "Diminished 7 Voicing", tab: ["x", aFret, sf(aFret+1), aFret, sf(aFret+1), "x"] });
                break;
            case "m7b5":
                rawPositions.push({ sys: "Caz", name: "Yarım Eksilmiş (m7b5)", tab: ["x", aFret, sf(aFret+1), aFret, sf(aFret+1), "x"] });
                break;
            case "aug":
                rawPositions.push({ sys: "Simetrik", name: "Artık Akor (Aug)", tab: [eFret, sf(eFret+3), sf(eFret+2), sf(eFret+2), "x", "x"] });
                break;
            case "11":
            case "m11":
            case "13":
            case "m13":
                rawPositions.push({ sys: "Caz", name: "Genişletilmiş Caz Voicing", tab: ["x", aFret, sf(aFret+2), sf(aFret+1), sf(aFret+2), sf(aFret+2)] });
                break;
            default:
                rawPositions.push({ sys: "Temel", name: "Kök Pozisyon", tab: [eFret, "x", "x", "x", "x", "x"] });
                break;
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
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (CAGED & Open Shape Engine)`;

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
