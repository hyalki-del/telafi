let audioCtx = null;
let currentSoundEngine = 'guitar';
let activeBend = null;
let initialY = 0;
let safetyTimeout = null;

export function setSoundEngine(val) {
    currentSoundEngine = val;
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

/**
 * Realistic Tone Generator using Physical Modeling & Subtractive Synthesis
 */
export function playTone(frequency, startTime = 0, duration = 2.0, targetGainNode = null) {
    initAudio();

    const now = audioCtx.currentTime;
    const start = now + startTime;
    const destination = targetGainNode || audioCtx.destination;

    if (currentSoundEngine === 'piano') {
        // --- REALISTIC PIANO MODELING ---
        // Pianos use multiple detuned strings per note, hammer transient noise, and a wooden soundboard filter.
        const hammerNoise = audioCtx.createBufferSource();
        const bufferSize = audioCtx.sampleRate * 0.05; // 50ms hammer strike transient
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        hammerNoise.buffer = noiseBuffer;

        const hammerFilter = audioCtx.createBiquadFilter();
        hammerFilter.type = 'bandpass';
        hammerFilter.frequency.setValueAtTime(1200, start);
        hammerFilter.Q.setValueAtTime(3.0, start);

        const hammerGain = audioCtx.createGain();
        hammerGain.gain.setValueAtTime(0.15, start);
        hammerGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);

        hammerNoise.connect(hammerFilter);
        hammerFilter.connect(hammerGain);
        hammerGain.connect(destination);
        hammerNoise.start(start);

        // Piano Harmonic Oscillators (Richer body string simulation)
        const osc1 = audioCtx.createOscillator(); // Fundamental
        const osc2 = audioCtx.createOscillator(); // Octave reinforcement
        const osc3 = audioCtx.createOscillator(); // Slight detuned string shimmer
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc3.type = 'sine';

        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start, start);
        osc3.frequency.setValueAtTime(frequency * 2.002, start); // Slight acoustic detuning beat

        const pianoFilter = audioCtx.createBiquadFilter();
        pianoFilter.type = 'lowpass';
        // Dynamic cutoff based on pitch (higher notes are brighter, lower notes are warmer)
        pianoFilter.frequency.setValueAtTime(Math.min(frequency * 4.5, 8000), start);
        pianoFilter.Q.setValueAtTime(1.0, start);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.3, start + 0.008); // Fast hammer attack
        // Natural piano long exponential decay
        gainNode.gain.setTargetAtTime(0.0001, start + 0.1, duration * 0.35);

        osc1.connect(pianoFilter);
        osc2.connect(pianoFilter);
        osc3.connect(pianoFilter);
        pianoFilter.connect(gainNode);
        gainNode.connect(destination);

        osc1.start(start);
        osc2.start(start);
        osc3.start(start);
        osc1.stop(start + duration);
        osc2.stop(start + duration);
        osc3.stop(start + duration);

        return { gainNode };

    } else {
        // --- REALISTIC GUITAR PLUCK MODELING ---
        // Simulated Karplus-Strong / Acoustic Body impulse response
        const pluckNoise = audioCtx.createBufferSource();
        const noiseDuration = 0.025; // 25ms pick scrape
        const bSize = audioCtx.sampleRate * noiseDuration;
        const nBuffer = audioCtx.createBuffer(1, bSize, audioCtx.sampleRate);
        const data = nBuffer.getChannelData(0);
        for (let i = 0; i < bSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bSize), 2); // tapering noise burst
        }
        pluckNoise.buffer = nBuffer;

        const stringBodyFilter = audioCtx.createBiquadFilter();
        stringBodyFilter.type = 'bandpass';
        stringBodyFilter.frequency.setValueAtTime(frequency * 2, start);
        stringBodyFilter.Q.setValueAtTime(4.0, start);

        const pluckGain = audioCtx.createGain();
        pluckGain.gain.setValueAtTime(0.25, start);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, start + noiseDuration);

        pluckNoise.connect(stringBodyFilter);
        stringBodyFilter.connect(pluckGain);
        pluckGain.connect(destination);
        pluckNoise.start(start);

        // String resonance oscillators
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start);

        const guitarFilter = audioCtx.createBiquadFilter();
        guitarFilter.type = 'lowpass';
        // Acoustic damping over time (strings lose high frequencies as they ring out)
        guitarFilter.frequency.setValueAtTime(frequency * 6, start);
        guitarFilter.frequency.exponentialRampToValueAtTime(frequency * 1.5, start + 0.4);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.35, start + 0.006); // Snappy pick attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc1.connect(guitarFilter);
        osc2.connect(guitarFilter);
        guitarFilter.connect(gainNode);
        gainNode.connect(destination);

        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + duration);
        osc2.stop(start + duration);

        return { osc1, osc2, gainNode };
    }
}

export function startBendingNote(frequency, fretElement, stringPathEl, fretLeftX, clientY) {
    initAudio();
    if (safetyTimeout) clearTimeout(safetyTimeout);

    initialY = clientY;
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = currentSoundEngine === 'piano' ? 'sine' : 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);
    osc2.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.012);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3.5, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);

    fretElement.classList.add('bending');

    activeBend = {
        osc1, osc2, gainNode,
        baseFreq: frequency,
        fretElement, stringPathEl, fretLeftX,
        totalWidth: stringPathEl.parentElement.clientWidth
    };

    safetyTimeout = setTimeout(() => { releaseBend(); }, 3000);
}

export function updateBend(currentY) {
    if (!activeBend) return;
    let deltaY = currentY - initialY;
    let bendMagnitude = Math.abs(deltaY);
    let bendSemitones = Math.min(2, (bendMagnitude / 50) * 2);
    let newFreq = activeBend.baseFreq * Math.pow(2, bendSemitones / 12);

    const now = audioCtx.currentTime;
    activeBend.osc1.frequency.setValueAtTime(newFreq, now);
    activeBend.osc2.frequency.setValueAtTime(newFreq, now);

    const midX = activeBend.fretLeftX + 30;
    const midY = 20 + (deltaY * 0.7);
    const pathData = `M 0 20 Q ${midX} ${midY} ${activeBend.totalWidth} 20`;
    activeBend.stringPathEl.setAttribute('d', pathData);
}

export function releaseBend() {
    if (!activeBend) return;
    if (safetyTimeout) clearTimeout(safetyTimeout);

    const now = audioCtx.currentTime;
    activeBend.gainNode.gain.setValueAtTime(activeBend.gainNode.gain.value, now);
    activeBend.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    activeBend.osc1.stop(now + 0.4);
    activeBend.osc2.stop(now + 0.4);

    try {
        activeBend.osc1.disconnect();
        activeBend.osc2.disconnect();
        activeBend.gainNode.disconnect();
    } catch (e) {}

    activeBend.stringPathEndEl?.setAttribute?.('d', `M 0 20 L ${activeBend.totalWidth} 20`);
    activeBend.fretElement.classList.remove('bending');
    activeBend = null;
}
