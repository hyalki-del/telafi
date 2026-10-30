import { setSoundEngine, playTone } from './audioEngine.js';
import { buildFretboard, renderVoicingOnFretboard, noteNames, stringTunings } from './fretboard.js';
import { scaleTiers } from './scaleEngine.js';
import { ChordEngine } from './chordEngine.js';

let currentMode = 'scales';
let currentRoot = 'A';
let currentScale = 'Minor Pentatonic';
let chordEngineInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seçenekler Menüsü Toggle
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

    // 2. Mod Değiştirme Butonları
    const btnScales = document.getElementById('btn-mode-scales');
    const btnChords = document.getElementById('btn-mode-chords');

    if (btnScales) btnScales.addEventListener('click', () => switchMode('scales'));
    if (btnChords) btnChords.addEventListener('click', () => switchMode('chords'));

    // 3. Başlangıç Kurulumu
    buildScaleControls();
    buildFretboard();

    // Akor Motorunu Konteyner Üzerinde Başlatıyoruz
    const chordPanelContainer = document.getElementById('panel-chords-ctrl');
    if (chordPanelContainer) {
        chordEngineInstance = new ChordEngine(chordPanelContainer);
    }

    // Global tetikleyici (Akor motoru içi değişikliklerde UI güncellenmesi için)
    window.appUpdateView = () => {
        if (chordEngineInstance) {
            currentRoot = chordEngineInstance.currentRoot;
        }
        updateFretboardDisplay();
        if (currentMode === 'chords' && chordEngineInstance) {
            chordEngineInstance.updateChordView();
        }
    };

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
    if (mode === 'chords' && chordEngineInstance) chordEngineInstance.updateChordView();
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

function updateFretboardDisplay() {
    const allFrets = document.querySelectorAll('.fret');
    if (!allFrets || allFrets.length === 0) return;

    // Tüm sınıfları temizle
    allFrets.forEach(f => {
        f.classList.remove('in-scale', 'is-root', 'in-chord', 'alt-voicing', 'active', 'root-note', 'chord-note');
    });

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

    } else if (currentMode === 'chords' && chordEngineInstance) {
        // ChordEngine üzerinden güncel akor pozisyonunu alıyoruz
        const chordInfo = chordEngineInstance.updateChordView();
        if (!chordInfo || !chordInfo.currentPos) return;

        // Fretboard.js'e eklediğimiz render fonksiyonunu tab dizisi ve kök indeks ile çağırıyoruz
        renderVoicingOnFretboard(chordInfo.currentPos.tab, chordInfo.rootIdx);
    }
}

function buildScaleControls() {
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
                updateFretboardDisplay();
            };
            rootContainer.appendChild(btn);
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
