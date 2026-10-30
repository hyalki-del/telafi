import { startBendingNote, updateBend, releaseBend } from './audioEngine.js';

// ChordEngine ve diğer motorlarla tam uyumlu Yüksekten Düşüğe Tel Sıralaması (High E -> Low E)
export const stringTunings = [
    { name: 'E4', freq: 329.63 }, // 0: High E
    { name: 'B3', freq: 246.94 }, // 1: B
    { name: 'G3', freq: 196.00 }, // 2: G
    { name: 'D3', freq: 146.83 }, // 3: D
    { name: 'A2', freq: 110.00 }, // 4: A
    { name: 'E2', freq: 82.41  }  // 5: Low E
];

export const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const openMidiNotes = [64, 59, 55, 50, 45, 40]; // High E'den Low E'ye MIDI başlangıçları
const totalFrets = 12;
const inlayFrets = [3, 5, 7, 9, 12];

export function buildFretboard() {
    const fretboardEl = document.getElementById('fretboard');
    if (!fretboardEl) return;
    fretboardEl.innerHTML = '';

    // DOM Reflow maliyetini sıfırlamak için DocumentFragment kullanıyoruz
    const fragment = document.createDocumentFragment();

    stringTunings.forEach((stringInfo, stringIndex) => {
        const row = document.createElement('div');
        row.className = 'string-row';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'string-svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'string-path');
        
        const updatePathWidth = () => {
            path.setAttribute('d', `M 0 20 L ${row.clientWidth} 20`);
        };
        setTimeout(updatePathWidth, 0);
        window.addEventListener('resize', updatePathWidth);

        svg.appendChild(path);
        row.appendChild(svg);

        for (let fretIndex = 0; fretIndex <= totalFrets; fretIndex++) {
            const fret = document.createElement('div');
            fret.className = 'fret';
            if (fretIndex === 0) fret.classList.add('nut');

            const midiNote = openMidiNotes[stringIndex] + fretIndex;
            const noteName = noteNames[midiNote % 12];
            const frequency = stringInfo.freq * Math.pow(2, fretIndex / 12);

            fret.dataset.note = noteName;
            fret.dataset.midi = midiNote;
            fret.dataset.string = stringIndex;
            fret.dataset.fret = fretIndex;

            if (fretIndex > 0 && inlayFrets.includes(fretIndex)) {
                if (fretIndex === 12 && (stringIndex === 1 || stringIndex === 4)) {
                    const inlay = document.createElement('div');
                    inlay.className = 'inlay ' + (stringIndex === 1 ? 'double-inlay-top' : 'double-inlay-bottom');
                    fret.appendChild(inlay);
                } else if (fretIndex !== 12 && stringIndex === 2) {
                    const inlay = document.createElement('div');
                    inlay.className = 'inlay';
                    fret.appendChild(inlay);
                }
            }

            const marker = document.createElement('div');
            marker.className = 'note-marker';
            marker.textContent = noteName;
            fret.appendChild(marker);

            fret.addEventListener('mousedown', (e) => {
                startBendingNote(frequency, fret, path, fret.offsetLeft, e.clientY);
            });
            fret.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startBendingNote(frequency, fret, path, fret.offsetLeft, e.touches[0].clientY);
            }, { passive: false });

            row.appendChild(fret);
        }
        fragment.appendChild(row);
    });

    fretboardEl.appendChild(fragment);
    fretboardEl.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('mousemove', (e) => { updateBend(e.clientY); });
    window.addEventListener('mouseup', () => { releaseBend(); });
    window.addEventListener('touchmove', (e) => { updateBend(e.touches[0].clientY); }, { passive: false });
    window.addEventListener('touchend', () => { releaseBend(); });
}

/**
 * Akor veya gam verilerini fretboard üzerinde görsel olarak işaretler.
 * tabArray: Örn. ["0", "2", "2", "2", "0", "x"] (High E -> Low E sırasıyla)
 * rootNoteIndex: Kök notanın nota indeksi (0-11 arası)
 */
export function renderVoicingOnFretboard(tabArray, rootNoteIndex = null) {
    // Önce tüm aktif/kök işaretlerini temizle
    const allFrets = document.querySelectorAll('.fret');
    allFrets.forEach(f => {
        f.classList.remove('active', 'root-note', 'chord-note');
        const marker = f.querySelector('.note-marker');
        if (marker) marker.style.display = ''; // Varsayılan görünürlük
    });

    if (!tabArray || !Array.isArray(tabArray)) return;

    tabArray.forEach((fretVal, stringIndex) => {
        if (fretVal === "x" || fretVal === null || fretVal === undefined) return;
        const fretNum = parseInt(fretVal);
        if (isNaN(fretNum)) return;

        // İlgili tel ve perdedeki DOM elementini bul
        const targetFretEl = document.querySelector(`.fret[data-string="${stringIndex}"][data-fret="${fretNum}"]`);
        if (targetFretEl) {
            targetFretEl.classList.add('active', 'chord-note');
            
            // Eğer basılan nota akorun kök notası ise özel sınıf ekle
            const noteName = targetFretEl.dataset.note;
            if (rootNoteIndex !== null && noteNames[rootNoteIndex] === noteName) {
                targetFretEl.classList.add('root-note');
            }
        }
    });
}
