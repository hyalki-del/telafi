import { startBendingNote, updateBend, releaseBend } from './audioEngine.js';

export const stringTunings = [
    { name: 'E4', freq: 329.63 },
    { name: 'B3', freq: 246.94 },
    { name: 'G3', freq: 196.00 },
    { name: 'D3', freq: 146.83 },
    { name: 'A2', freq: 110.00 },
    { name: 'E2', freq: 82.41  }
];

export const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const openMidiNotes = [64, 59, 55, 50, 45, 40];
const totalFrets = 12;
const inlayFrets = [3, 5, 7, 9, 12];

export function buildFretboard() {
    const fretboardEl = document.getElementById('fretboard');
    fretboardEl.innerHTML = '';

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
        fretboardEl.appendChild(row);
    });

    fretboardEl.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('mousemove', (e) => { updateBend(e.clientY); });
    window.addEventListener('mouseup', () => { releaseBend(); });
    window.addEventListener('touchmove', (e) => { updateBend(e.touches[0].clientY); }, { passive: false });
    window.addEventListener('touchend', () => { releaseBend(); });
}
