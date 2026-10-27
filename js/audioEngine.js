export function playTone(frequency, startTime = 0, duration = 2.0, targetGainNode = null) {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Güncel zaman baz alınarak geçmişe planlama yapılması engellendi
    const now = audioCtx.currentTime;
    const start = now + startTime;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    if (currentSoundEngine === 'piano') {
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.25, start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    } else {
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, start);
        osc2.frequency.setValueAtTime(frequency, start);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 3.5, start);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(0.35, start + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }

    if (currentSoundEngine !== 'guitar') {
        osc1.connect(gainNode);
        osc2.connect(gainNode);
    }

    const destination = targetGainNode || audioCtx.destination;
    gainNode.connect(destination);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + duration);
    osc2.stop(start + duration);

    return { osc1, osc2, gainNode };
}
