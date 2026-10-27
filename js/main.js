import { setSoundEngine, playTone } from './audioEngine.js';
import { buildFretboard, noteNames, stringTunings } from './fretboard.js';
import { scaleTiers } from './scaleEngine.js';
import { chordTypes, chordFormulas, getAllChordPositions } from './chordEngine.js';

let currentMode = 'scales';
let currentRoot = 'A';
let currentScale = 'Minor Pentatonic';
let currentChordType = 'maj';
let currentPositionIndex = 0;

// UI Menüleri ve Dinleyiciler
document.addEventListener('DOMContentLoaded', () => {
    
    // Seçenekler Menüsü Toggle
    const optionsBtn = document.getElementById('options-toggle-btn');
    const optionsDropdown = document.getElementById('options-dropdown');
    
    if (optionsBtn && optionsDropdown) {
        optionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsDropdown.classList.toggle('show');
        });
    }

    window.addEventListener('click', () => {
        if (optionsDropdown) optionsDropdown.classList.remove('show');
    });

    const soundSelect = document.getElementById('sound-engine-select');
    if (soundSelect) {
        soundSelect.addEventListener('change', (e) => {
            setSoundEngine(e.target.value);
        });
    }

    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const speedVal = document.getElementById('speed-val');
            if (speedVal) speedVal.innerText = parseFloat(e.target.value).toFixed(1) + 'x';
        });
    }

    // Mod Değiştirme Butonları
    const btnScales = document.getElementById('btn-mode-scales');
    const btnChords = document.getElementById('btn-mode-chords');

    if (btnScales) btnScales.addEventListener('click', () => switchMode('scales'));
    if (btnChords) btnChords.addEventListener('click', () => switchMode('chords'));

    // Pozisyon Değiştirme ve Dinle Butonları
    const posCycleBtn = document.getElementById('position-cycle-btn');
    if (posCycleBtn) {
        posCycleBtn.addEventListener('click', () => {
            const positions = getAllChordPositions(currentRoot, currentChordType);
            currentPositionIndex = (currentPositionIndex + 1) % positions.length;
            updateChordView();
        });
    }

    const playChordBtn = document.getElementById('play-chord-btn');
    if (playChordBtn) {
        playChordBtn.addEventListener('click', () => {
            const positions = getAllChordPositions(currentRoot, currentChordType);
            if (!positions || positions.length === 0) return;
            const currentPos = positions[currentPositionIndex];
            
            let activeFreqs = [];
            currentPos.tab.forEach((tabVal, stringIdx) => {
                if (tabVal !== "x") {
                    const fretIdx = parseInt(tabVal);
                    const stringInfo = stringTunings[stringIdx];
                    const freq = stringInfo.freq * Math.pow(2, fretIdx / 12);
                    activeFreqs.push({ freq, stringIdx });
                }
            });

            // Kalından tize doğru arpej sıralaması
            activeFreqs.sort((a, b) => b.stringIdx - a.stringIdx);

            const speedSliderEl = document.getElementById('speed-slider');
            const speedMultiplier = speedSliderEl ? parseFloat(speedSliderEl.value) : 1.0;
            const delayStep = 0.115 / speedMultiplier; 

            // setTimeout yerine Web Audio API zaman offset yönetimi (Sesin kesilmesini önler)
            activeFreqs.forEach((item, idx) => {
                playTone(item.freq, idx * delayStep, 2.0);
            });
        });
    }

    // Başlangıç Kurulumu
    buildControls();
    buildFretboard();
    switchMode('scales');
});

function switchMode(mode) {
    currentMode = mode;
    
    const btnScales = document.getElementById('btn-mode-scales');
    const btnChords = document.getElementById('btn-mode-chords');
    if (btnScales) btnScales.classList.toggle('active', mode === 'scales');
    if (btnChords) btnChords.classList.toggle('active', mode === 'chords');

    const panelScales = document.getElementById('panel-scales');
    const panelChords = document.getElementById('panel-chords-ctrl');
    const actionBar = document.getElementById('chord-action-bar');
    const scaleTheory = document.getElementById('bottom-scale-theory-panel');
    const chordTheory = document.getElementById('bottom-theory-panel');

    if (panelScales) panelScales.classList.toggle('hidden', mode !== 'scales');
    if (panelChords) panelChords.classList.toggle('hidden', mode !== 'chords');
    if (actionBar) actionBar.classList.toggle('hidden', mode !== 'chords');
    if (scaleTheory) scaleTheory.classList.toggle('hidden', mode !== 'scales');
    if (chordTheory) chordTheory.classList.toggle('hidden', mode !== 'chords');

    updateFretboardDisplay();
    if (mode === 'scales') updateScaleView();
    if (mode === 'chords') updateChordView();
}

function updateScaleView() {
    if (!currentScale) {
        const display = document.getElementById("scale-theory-display");
        if (display) display.innerHTML = "Gam seçilmedi.";
        return;
    }

    let scaleObj = null;
    for (let tier in scaleTiers) {
        if (scaleTiers[tier][currentScale]) scaleObj = scaleTiers[tier][currentScale];
    }
    if (!scaleObj) return;

    const rootIndex = noteNames.indexOf(currentRoot);
    const notes = scaleObj.intervals.map(i => noteNames[(rootIndex + i) % 12]);

    const titleEl = document.getElementById("bottom-scale-title");
    if (titleEl) titleEl.innerText = `${currentRoot} ${currentScale}`;
    
    const notesHTML = notes.map(n => `<span class="note-badge">${n}</span>`).join('');
    
    const displayEl = document.getElementById("scale-theory-display");
    if (displayEl) {
        displayEl.innerHTML = `
            <div style="margin-bottom:8px;"><b>Gam Notaları:</b> ${notesHTML}</div>
            <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${scaleObj.formula}</span></div>
            <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--accent-color); margin-top:6px;">${scaleObj.desc}</div>
        `;
    }
}

function updateChordView() {
    const rootIndex = noteNames.indexOf(currentRoot);
    const formula = chordFormulas[currentChordType];
    const chordName = `${currentRoot} ${chordTypes.find(t => t.id === currentChordType).name}`;
    
    const notes = formula.intervals.map(i => noteNames[(rootIndex + i) % 12]);
    const positions = getAllChordPositions(currentRoot, currentChordType);
    
    if (currentPositionIndex >= positions.length) currentPositionIndex = 0;
    const currentPos = positions[currentPositionIndex];

    const posBtnText = document.getElementById("pos-btn-text");
    if (posBtnText) {
        posBtnText.innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${currentPositionIndex + 1} / ${positions.length})</span>`;
    }
    
    const chordTitle = document.getElementById("bottom-chord-title");
    if (chordTitle) chordTitle.innerText = chordName;

    const notesHTML = notes.map(n => `<span class="note-badge">${n}</span>`).join('');
    const theoryDisplay = document.getElementById("theory-display");
    if (theoryDisplay) {
        theoryDisplay.innerHTML = `
            <div style="margin-bottom:8px;"><b>Akor Notaları:</b> ${notesHTML}</div>
            <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${formula.name}</span></div>
            <div style="margin-bottom:8px;"><b>Mevcut Alternatif (Sarı Yanan):</b> <span style="color:var(--alt-color); font-weight:bold;">${currentPos.sys} - ${currentPos.name}</span></div>
            <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--alt-color); margin-top:6px;">${formula.theoryDesc}</div>
        `;
    }

    updateFretboardDisplay();
}

function updateFretboardDisplay() {
    const allFrets = document.querySelectorAll('.fret');
    if (!allFrets || allFrets.length === 0) return;

    allFrets.forEach(f => f.classList.remove('in-scale', 'is-root', 'in-chord', 'alt-voicing'));

    const rootIndex = noteNames.indexOf(currentRoot);

    if (currentMode === 'scales') {
        if (!currentScale) return;
        let scaleObj = null;
        for (let tier in scaleTiers) {
            if (scaleTiers[tier][currentScale]) scaleObj = scaleTiers[tier][currentScale];
        }
        if (!scaleObj) return;

        const scaleNoteIndices = scaleObj.intervals.map(interval => (rootIndex + interval) % 12);

        allFrets.forEach(f => {
            const noteIdx = noteNames.indexOf(f.dataset.note);
            if (scaleNoteIndices.includes(noteIdx)) {
                if (noteIdx === rootIndex) f.classList.add('is-root');
                else f.classList.add('in-scale');
            }
        });

        updateScaleView();

    } else if (currentMode === 'chords') {
        const formula = chordFormulas[currentChordType];
        const chordNoteIndices = formula.intervals.map(i => (rootIndex + i) % 12);

        const positions = getAllChordPositions(currentRoot, currentChordType);
        const currentPos = positions[currentPositionIndex];

        allFrets.forEach(f => {
            const stringIdx = parseInt(f.dataset.string);
            const fretIdx = parseInt(f.dataset.fret);
            const noteIdx = noteNames.indexOf(f.dataset.note);

            if (chordNoteIndices.includes(noteIdx)) {
                if (noteIdx === rootIndex) {
                    f.classList.add('is-root');
                } else {
                    f.classList.add('in-chord');
                }
            }

            if (currentPos) {
                const tabVal = currentPos.tab[stringIdx];
                if (tabVal !== "x" && parseInt(tabVal) === fretIdx) {
                    f.classList.add('alt-voicing');
                }
            }
        });
    }
}

function buildControls() {
    // Root Note (Gam) Butonları
    const rootContainer = document.getElementById('root-selector');
    if (rootContainer) {
        noteNames.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (note === currentRoot ? ' active' : '');
            btn.textContent = note;
            btn.onclick = () => {
                currentRoot = note;
                document.querySelectorAll('#root-selector .ctrl-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                syncRootButtons();
                updateFretboardDisplay();
            };
            rootContainer.appendChild(btn);
        });
    }

    // Kök Ses (Akor) Butonları
    const chordRootContainer = document.getElementById('chord-root-buttons');
    if (chordRootContainer) {
        noteNames.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (note === currentRoot ? ' active' : '');
            btn.textContent = note;
            btn.onclick = () => {
                currentRoot = note;
                currentPositionIndex = 0;
                syncRootButtons();
                updateChordView();
            };
            chordRootContainer.appendChild(btn);
        });
    }

    // Akor Tipi Butonları
    const chordTypeContainer = document.getElementById('chord-type-buttons');
    if (chordTypeContainer) {
        chordTypes.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (t.id === currentChordType ? ' active' : '');
            btn.textContent = t.name;
            btn.onclick = () => {
                currentChordType = t.id;
                currentPositionIndex = 0;
                document.querySelectorAll('#chord-type-buttons .ctrl-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateChordView();
            };
            chordTypeContainer.appendChild(btn);
        });
    }

    // Gam Seviyeleri (Start, Understand, Advance)
    const populateTier = (containerId, tierObj, includeClear = false) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (includeClear) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'ctrl-btn clear-btn';
            clearBtn.textContent = 'Clear';
            clearBtn.onclick = () => {
                currentScale = null;
                document.querySelectorAll('#panel-scales .ctrl-btn').forEach(b => {
                    if (!b.classList.contains('clear-btn')) b.classList.remove('active');
                });
                clearBtn.classList.add('active');
                updateFretboardDisplay();
                const display = document.getElementById("scale-theory-display");
                if (display) display.innerHTML = "Gam seçilmedi.";
            };
            container.appendChild(clearBtn);
        }

        Object.keys(tierObj).forEach(scaleName => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (scaleName === currentScale ? ' active' : '');
            btn.textContent = scaleName;
            btn.onclick = () => {
                currentScale = scaleName;
                document.querySelectorAll('#panel-scales .ctrl-btn').forEach(b => {
                    if (!b.classList.contains('clear-btn')) b.classList.remove('active');
                });
                btn.classList.add('active');
                updateFretboardDisplay();
            };
            container.appendChild(btn);
        });
    };

    populateTier('tier-start', scaleTiers['Start'], true);
    populateTier('tier-understand', scaleTiers['Understand'], false);
    populateTier('tier-advance', scaleTiers['Advance'], false);
}

function syncRootButtons() {
    document.querySelectorAll('#root-selector .ctrl-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === currentRoot);
    });
    document.querySelectorAll('#chord-root-buttons .ctrl-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === currentRoot);
    });
}
