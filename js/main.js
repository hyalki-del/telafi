import { setSoundEngine, playTone } from './audioEngine.js';
import { buildFretboard, noteNames, stringTunings } from './fretboard.js';
import { scaleTiers } from './scaleEngine.js';
import { chordTypes, chordFormulas, getAllChordPositions } from './chordEngine.js';

let currentMode = 'scales';
let currentRoot = 'A';
let currentScale = 'Minor Pentatonic';
let currentChordType = 'maj';
let currentPositionIndex = 0;

// UI Menüleri
document.getElementById('options-toggle-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('options-dropdown').classList.toggle('show');
});
window.onclick = () => {
    document.getElementById('options-dropdown').classList.remove('show');
};

document.getElementById('sound-engine-select').addEventListener('change', (e) => {
    setSoundEngine(e.target.value);
});

document.getElementById('speed-slider').addEventListener('input', (e) => {
    document.getElementById('speed-val').innerText = parseFloat(e.target.value).toFixed(1) + 'x';
});

// Mod Değiştirme
document.getElementById('btn-mode-scales').addEventListener('click', () => switchMode('scales'));
document.getElementById('btn-mode-chords').addEventListener('click', () => switchMode('chords'));

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btn-mode-scales').classList.toggle('active', mode === 'scales');
    document.getElementById('btn-mode-chords').classList.toggle('active', mode === 'chords');

    document.getElementById('panel-scales').classList.toggle('hidden', mode !== 'scales');
    document.getElementById('panel-chords-ctrl').classList.toggle('hidden', mode !== 'chords');
    document.getElementById('chord-action-bar').classList.toggle('hidden', mode !== 'chords');
    
    document.getElementById('bottom-scale-theory-panel').classList.toggle('hidden', mode !== 'scales');
    document.getElementById('bottom-theory-panel').classList.toggle('hidden', mode !== 'chords');

    updateFretboardDisplay();
    if (mode === 'scales') updateScaleView();
    if (mode === 'chords') updateChordView();
}

function updateScaleView() {
    if (!currentScale) return;
    let scaleObj = null;
    for (let tier in scaleTiers) {
        if (scaleTiers[tier][currentScale]) scaleObj = scaleTiers[tier][currentScale];
    }
    if (!scaleObj) return;

    const rootIndex = noteNames.indexOf(currentRoot);
    const notes = scaleObj.intervals.map(i => noteNames[(rootIndex + i) % 12]);

    document.getElementById("bottom-scale-title").innerText = `${currentRoot} ${currentScale}`;
    const notesHTML = notes.map(n => `<span class="note-badge">${n}</span>`).join('');
    
    document.getElementById("scale-theory-display").innerHTML = `
        <div style="margin-bottom:8px;"><b>Gam Notaları:</b> ${notesHTML}</div>
        <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${scaleObj.formula}</span></div>
        <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--accent-color); margin-top:6px;">${scaleObj.desc}</div>
    `;
}

function updateChordView() {
    const rootIndex = noteNames.indexOf(currentRoot);
    const formula = chordFormulas[currentChordType];
    const chordName = `${currentRoot} ${chordTypes.find(t => t.id === currentChordType).name}`;
    
    const notes = formula.intervals.map(i => noteNames[(rootIndex + i) % 12]);
    const positions = getAllChordPositions(currentRoot, currentChordType);
    
    if (currentPositionIndex >= positions.length) currentPositionIndex = 0;
    const currentPos = positions[currentPositionIndex];

    document.getElementById("pos-btn-text").innerHTML = `🔄 Alternatif Pozisyon: <b style="color:#ffffff;">${currentPos.sys} (${currentPos.name})</b> <span style="color:var(--alt-color);">(${currentPositionIndex + 1} / ${positions.length})</span>`;
    document.getElementById("bottom-chord-title").innerText = chordName;

    const notesHTML = notes.map(n => `<span class="note-badge">${n}</span>`).join('');
    document.getElementById("theory-display").innerHTML = `
        <div style="margin-bottom:8px;"><b>Akor Notaları:</b> ${notesHTML}</div>
        <div style="margin-bottom:8px;"><b>Aralık Formülü:</b> <span style="color:#ffb400; font-weight:bold;">${formula.name}</span></div>
        <div style="margin-bottom:8px;"><b>Mevcut Alternatif (Sarı Yanan):</b> <span style="color:var(--alt-color); font-weight:bold;">${currentPos.sys} - ${currentPos.name}</span></div>
        <div style="background:#121212; padding:10px; border-radius:6px; border-left:3px solid var(--alt-color); margin-top:6px;">${formula.theoryDesc}</div>
    `;

    updateFretboardDisplay();
}

function updateFretboardDisplay() {
    const allFrets = document.querySelectorAll('.fret');
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

document.getElementById('position-cycle-btn').addEventListener('click', () => {
    const positions = getAllChordPositions(currentRoot, currentChordType);
    currentPositionIndex = (currentPositionIndex + 1) % positions.length;
    updateChordView();
});

document.getElementById('play-chord-btn').addEventListener('click', () => {
    const positions = getAllChordPositions(currentRoot, currentChordType);
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

    activeFreqs.sort((a, b) => b.stringIdx - a.stringIdx);

    const speedMultiplier = parseFloat(document.getElementById('speed-slider').value);
    const baseDelay = 0.115;
    const delayStep = baseDelay / speedMultiplier; 

    const now = audioCtxTime(); // Fixed reference or simple audio context check
    // Note: audioCtx is managed inside audioEngine, let's trigger through a clean helper or directly if exposed.
    // Actually, playTone manages audioCtx internally. Let's look at how playTone works:
    activeFreqs.forEach((item, idx) => {
        // We can use performance.now() or let playTone handle context time inside.
        // Let's pass a small delay offset or let audioEngine handle start time.
    });
});

// Kontrolleri ve Arayüz Butonlarını İnşa Etme
function buildControls() {
    const rootContainer = document.getElementById('root-selector');
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

    const chordRootContainer = document.getElementById('chord-root-buttons');
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

    const chordTypeContainer = document.getElementById('chord-type-buttons');
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

    const populateTier = (containerId, tierObj, includeClear = false) => {
        const container = document.getElementById(containerId);
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
                document.getElementById("scale-theory-display").innerHTML = "Gam seçilmedi.";
            };
            container.appendChild(clearBtn);
        }

        Object.keys(tierObj).forEach(scaleName => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (scaleName === currentScale ? ' active' : '');
            btn.textContent = scaleName;
            btn.onclick = () => {
                currentScale = scaleName;
                document.querySelectorAll('#panel-scales .ctrl-btn').forEach(b => b.classList.remove('active'));
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

// Play chord button fix for audio context time in main.js
import { playTone } from './audioEngine.js';
// (Note: playTone handles audioContext initialization internally).
document.getElementById('play-chord-btn').onclick = () => {
    const positions = getAllChordPositions(currentRoot, currentChordType);
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

    activeFreqs.sort((a, b) => b.stringIdx - a.stringIdx);

    const speedMultiplier = parseFloat(document.getElementById('speed-slider').value);
    const delayStep = 0.115 / speedMultiplier; 

    // We can just call playTone with staggered start times. 
    // Since AudioContext.currentTime will be evaluated inside playTone, 
    // let's make sure playTone handles relative offsets or accepts context time.
    // Actually, let's do a quick helper in audioEngine or calculate inside main using a shared audio time if needed.
    // For simplicity, playTone uses audioCtx.currentTime when called. If called in a loop with setTimeout or absolute offsets:
    activeFreqs.forEach((item, idx) => {
        setTimeout(() => {
            playTone(item.freq, 0, 2.0);
        }, idx * delayStep * 1000);
    });
};

// Uygulama Başlangıcı
buildControls();
buildFretboard();
updateFretboardDisplay();
