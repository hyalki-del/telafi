let audioCtx = null;
let currentSoundEngine = 'guitar';
let activeBend = null;
let initialY = 0;
let safetyTimeout = null;

export function setSoundEngine(val) {
    currentSoundEngine = val;
}

// Guaranteed synchronous/asynchronous sync for browser audio policy
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function playTone(frequency, startTime = 0, duration = 2.0, targetGainNode = null) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const start = now + startTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const destination = targetGainNode || ctx.destination;

    if (currentSoundEngine === 'piano') {
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.25, start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
    } else {
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(frequency * 4.0, 8000), start);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.35, start + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }

    gainNode.connect(destination);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + duration);
    osc2.stop(start + duration);

    return { osc1, osc2, gainNode };
}

export function startBendingNote(frequency, fretElement, stringPathEl, fretLeftX, clientY) {
    const ctx = getAudioContext();
    if (safetyTimeout) clearTimeout(safetyTimeout);
    if (!ctx) return;

    initialY = clientY;
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = currentSoundEngine === 'piano' ? 'sine' : 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);
    osc2.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.015);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3.5, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

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
    const ctx = getAudioContext();
    if (!ctx) return;

    let deltaY = currentY - initialY;
    let bendMagnitude = Math.abs(deltaY);
    let bendSemitones = Math.min(2, (bendMagnitude / 50) * 2);
    let newFreq = activeBend.baseFreq * Math.pow(2, bendSemitones / 12);

    const now = ctx.currentTime;
    activeBend.osc1.frequency.setValueAtTime(newFreq, now);
    activeBend.osc2.frequency.setValueAtTime(newFreq, now);

    const midX = activeBend.fretLeftX + 30;
    const midY = 20 + (deltaY * 0.7);
    const pathData = `M 0 20 Q ${midX} ${midY} ${activeBend.totalWidth} 20`;
    activeBend.stringPathEl.setAttribute('d', pathData);
}

export function releaseBend() {
    if (!activeBend) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (safetyTimeout) clearTimeout(safetyTimeout);

    const now = ctx.currentTime;
    activeBend.gainNode.gain.setValueAtTime(activeBend.gainNode.gain.value, now);
    activeBend.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    activeBend.osc1.stop(now + 0.4);
    activeBend.osc2.stop(now + 0.4);

    try {
        activeBend.osc1.disconnect();
        activeBend.osc2.disconnect();
        activeBend.gainNode.disconnect();
    } catch (e) {}

    activeBend.stringPathEl.setAttribute('d', `M 0 20 L ${activeBend.totalWidth} 20`);
    activeBend.fretElement.classList.remove('bending');
    activeBend = null;
}
