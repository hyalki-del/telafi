import * as Tone from 'https://esm.sh/tone';

let currentSoundEngine = 'guitar';
let activeBendNode = null;
let safetyTimeout = null;

export function setSoundEngine(val) {
    currentSoundEngine = val;
}

// Ensure AudioContext starts on user interaction
async function initAudio() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
}

/**
 * Play tone using Tone.js physical modeling & synths
 */
export function playTone(frequency, startTime = 0, duration = 2.0) {
    initAudio();

    const now = Tone.now() + startTime;

    if (currentSoundEngine === 'guitar') {
        // --- REALISTIC GUITAR (Karplus-Strong Physical Modeling) ---
        const pluckSynth = new Tone.PluckSynth({
            attackNoise: 1.2,
            damping: 4000,
            resonance: 0.98
        }).toDestination();

        // Trigger note by frequency or MIDI note name
        pluckSynth.triggerAttack(frequency, now);

        // Clean up node after duration
        setTimeout(() => {
            pluckSynth.dispose();
        }, (startTime + duration) * 1000);

    } else {
        // --- MELLOW PIANO SYNTH ---
        const pianoSynth = new Tone.Synth({
            oscillator: { type: 'triangle8' },
            envelope: {
                attack: 0.015,
                decay: 1.2,
                sustain: 0.1,
                release: 1.5
            }
        }).toDestination();

        pianoSynth.triggerAttackRelease(frequency, duration, now);

        setTimeout(() => {
            pianoSynth.dispose();
        }, (startTime + duration) * 1000);
    }
}

/**
 * Interactive String Bending with Tone.js Synth
 */
export function startBendingNote(frequency, fretElement, stringPathEl, fretLeftX, clientY) {
    initAudio();
    if (safetyTimeout) clearTimeout(safetyTimeout);

    const initialY = clientY;
    const now = Tone.now();

    const synth = new Tone.Synth({
        oscillator: { type: currentSoundEngine === 'piano' ? 'sine' : 'sawtooth' },
        envelope: { attack: 0.02, decay: 1, sustain: 0.8, release: 0.4 }
    }).toDestination();

    synth.triggerAttack(frequency, now);
    fretElement.classList.add('bending');

    const totalWidth = stringPathEl.parentElement.clientWidth;

    // Track bend movement globally
    const handleMove = (e) => {
        const clientYPos = e.touches ? e.touches[0].clientY : e.clientY;
        let deltaY = clientYPos - initialY;
        let bendSemitones = Math.min(2, (Math.abs(deltaY) / 50) * 2);
        
        // Pitch bend calculation
        let newFreq = frequency * Math.pow(2, bendSemitones / 12);
        synth.frequency.rampTo(newFreq, 0.02);

        const midX = fretLeftX + 30;
        const midY = 20 + (deltaY * 0.7);
        stringPathEl.setAttribute('d', `M 0 20 Q ${midX} ${midY} ${totalWidth} 20`);
    };

    const handleRelease = () => {
        synth.triggerRelease(Tone.now() + 0.1);
        stringPathEl.setAttribute('d', `M 0 20 L ${totalWidth} 20`);
        fretElement.classList.remove('bending');
        
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleRelease);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleRelease);
        
        setTimeout(() => synth.dispose(), 600);
        if (safetyTimeout) clearTimeout(safetyTimeout);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleRelease);

    safetyTimeout = setTimeout(() => { handleRelease(); }, 3000);
}

// Stub exports to maintain compatibility with existing main.js bindings
export function updateBend() {}
export function releaseBend() {}
