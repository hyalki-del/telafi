import { playTone } from './audioEngine.js';
import { stringTunings, noteNames } from './fretboard.js';

export class ChordEngine {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = Object.assign({
            totalFrets: 12,
            maxSpan: 4, // Max fret span for human hand ergonomics
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
                <div class="section-label" style="font-weight: bold; font-size: 0.85rem; color: #ff9800; margin-bottom: 6px; text-transform: uppercase;">3. Akor Tipi / Uzantı (Rule Engine)</div>
                <div class="type-selector" id="chord-type-buttons" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
        `;
    }

    generateVoicings(rootNote, chordType) {
        const rootIndex = noteNames.indexOf(rootNote);
        const formulaObj = this.chordFormulas[chordType] || this.chordFormulas["maj"];
        const targetIntervals = formulaObj.intervals;
        
        const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
        const openMidiNotes = [64, 59, 55, 50, 45, 40]; 
        
        let validVoicings = [];

        const evaluateTab = (tab, positionName, systemName) => {
            let playedFrets = [];
            let soundingPitchClasses = new Set();
            let hasRoot = false;

            for (let sIdx = 5; sIdx >= 0; sIdx--) {
                const val = tab[sIdx];
                if (val !== "x") {
                    const fretNum = parseInt(val);
                    playedFrets.push(fretNum);
                    const midi = openMidiNotes[sIdx] + fretNum;
                    const pc = midi % 12;
                    soundingPitchClasses.add(pc);
                    if (pc === rootIndex) hasRoot = true;
                }
            }

            if (playedFrets.length < 3 || !hasRoot) return;

            let matchedCount = 0;
            targetPitchClasses.forEach(tp => {
                if (soundingPitchClasses.has(tp)) matchedCount++;
            });
            if (matchedCount < Math.min(3, targetPitchClasses.length)) return;

            const frettedOnly = playedFrets.filter(f => f > 0);
            if (frettedOnly.length > 0) {
                const minF = Math.min(...frettedOnly);
                const maxF = Math.max(...frettedOnly);
                if ((maxF - minF) > this.options.maxSpan) return;
            }

            const tabString = tab.join(',');
            if (!validVoicings.some(v => v.tab.join(',') === tabString)) {
                validVoicings.push({
                    sys: systemName,
                    name: positionName,
                    tab: tab.map(v => v.toString())
                });
            }
        };

        for (let baseFret = 0; baseFret <= 12; baseFret++) {
            for (let f = baseFret; f <= baseFret + 4; f++) {
                if (f > 12) continue;
                if ((openMidiNotes[5] + f) % 12 === rootIndex) {
                    let candidate = ["x", "x", "x", "x", "x", "x"];
                    candidate[5] = f.toString();

                    for (let s = 4; s >= 0; s--) {
                        let found = false;
                        for (let sf = Math.max(0, f - 1); sf <= f + 3; sf++) {
                            if (sf > 12) continue;
                            const pc = (openMidiNotes[s] + sf) % 12;
                            if (targetPitchClasses.includes(pc)) {
                                candidate[s] = sf.toString();
                                found = true;
                                break;
                            }
                        }
                        if (!found && s < 3) candidate[s] = "x";
                    }
                    evaluateTab(candidate, `E-Shape @ Fret ${f}`, 'Rule-Engine');
                }
            }

            for (let f = baseFret; f <= baseFret + 4; f++) {
                if (f > 12) continue;
                if ((openMidiNotes[4] + f) % 12 === rootIndex) {
                    let candidate = ["x", "x", "x", "x", "x", "x"];
                    candidate[4] = f.toString();
                    candidate[5] = "x";

                    for (let s = 3; s >= 0; s--) {
                        let found = false;
                        for (let sf = Math.max(0, f - 1); sf <= f + 3; sf++) {
                            if (sf > 12) continue;
                            const pc = (openMidiNotes[s] + sf) % 12;
                            if (targetPitchClasses.includes(pc)) {
                                candidate[s] = sf.toString();
                                break;
                            }
                        }
                    }
                    evaluateTab(candidate, `A-Shape @ Fret ${f}`, 'Rule-Engine');
                }
            }

            for (let f = baseFret; f <= baseFret + 4; f++) {
                if (f > 12) continue;
                if ((openMidiNotes[3] + f) % 12 === rootIndex) {
                    let candidate = ["x", "x", "x", "x", "x", "x"];
                    candidate[3] = f.toString();
                    candidate[5] = "x";
                    candidate[4] = "x";

                    for (let s = 2; s >= 0; s--) {
                        for (let sf = Math.max(0, f - 1); sf <= f + 3; sf++) {
                            if (sf > 12) continue;
                            const pc = (openMidiNotes[s] + sf) % 12;
                            if (targetPitchClasses.includes(pc)) {
                                candidate[s] = sf.toString();
                                break;
                            }
                        }
                    }
                    evaluateTab(candidate, `Triad @ Fret ${f}`, 'Rule-Engine');
                }
            }
        }

        if (validVoicings.length === 0) {
            const eFret = (rootIndex - (40 % 12) + 12) % 12;
            validVoicings.push({
                sys: "Theory Fallback",
                name: "Root Octave",
                tab: [eFret.toString(), "x", "x", "x", "x", eFret.toString()]
            });
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
        const currentPos = positions[this.currentPositionIndex] || { sys: "Default", name: "Root", tab: ["x","x","x","x","x","x"] };

        const formulaObj = this.chordFormulas[this.currentChordType] || { formula: "1 - 3 - 5", intervals: [0, 4, 7], construction: "", soundFeel: "" };
        const rootIdx = noteNames.indexOf(this.currentRoot);
        const constituentNotes = formulaObj.intervals.map(i => noteNames[(rootIdx + i) % 12]);

        const posBtnText = document.getElementById("pos-btn-text");
        if (posBtnText) {
            posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${this.currentPositionIndex + 1} / ${positions.length})</span>`;
        }

        const chordTitle = document.getElementById("bottom-chord-title");
        if (chordTitle) chordTitle.innerText = `${this.currentRoot} ${this.currentChordType.toUpperCase()} (Rule-Based Engine)`;

        const theoryDisplay = document.getElementById("theory-display");
        if (theoryDisplay) {
            const notesHTML = constituentNotes.map(n => `<span class="note-badge">${n}</span>`).join('');
            theoryDisplay.innerHTML = `
                <div style="margin-bottom:8px;"><b>Akor Notaları:</b> ${notesHTML}</div>
                <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${formulaObj.formula}</span></div>
                <div style="margin-bottom:8px;"><b>Nasıl Kurulur (Yapı):</b> ${formulaObj.construction}</div>
                <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--alt-color); margin-top:6px;">${formulaObj.soundFeel}</div>
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
                const positions = this.generateVoicings(this.currentRoot, this.currentChordType);
                if (this.currentPositionIndex >= positions.length) this.currentPositionIndex = 0;
                const currentPos = positions[this.currentPositionIndex];
                if (!currentPos) return;
                
                const frequencies = this.getVoicingFrequencies(currentPos.tab);
                const speedSlider = document.getElementById('speed-slider');
                const speedMultiplier = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                const delayStep = 0.115 / speedMultiplier;

                // Flipped playback: bottom string (low E / index 5) to top string (high E / index 0)
                for (let index = 5; index >= 0; index--) {
                    const freq = frequencies[index];
                    if (freq) {
                        const stepOrder = 5 - index;
                        playTone(freq, stepOrder * delayStep, 1.5);
                    }
                }
            };
        }
    }
}
