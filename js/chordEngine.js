generateVoicings(rootNote, chordType) {
        try {
            const rootIndex = getNoteIndex(rootNote);
            const formulaObj = this.chordFormulas[chordType] || this.chordFormulas["maj"];
            const targetIntervals = formulaObj.intervals || [0, 4, 7];
            const targetPitchClasses = targetIntervals.map(i => (rootIndex + i) % 12);
            
            const openMidiNotes = [64, 59, 55, 50, 45, 40]; // High E to Low E
            let validVoicings = [];

            const evaluateAndPushVoicing = (tab, systemName, posName) => {
                let soundingNotes = [];
                let hasRoot = false;

                for (let s = 5; s >= 0; s--) {
                    const val = tab[s];
                    if (val !== "x" && val !== null && val !== undefined) {
                        const fretNum = parseInt(val);
                        if (isNaN(fretNum)) continue;
                        const midi = openMidiNotes[s] + fretNum;
                        const pc = midi % 12;
                        
                        // Notanın akor formülüne ait olup olmadığını kontrol et
                        if (targetPitchClasses.includes(pc)) {
                            soundingNotes.push({ string: s, fret: fretNum, pc });
                            if (pc === rootIndex) hasRoot = true;
                        }
                    }
                }

                // En az 3 telin ses verdiginden ve kok notayi icerdiginden emin ol
                if (soundingNotes.length >= 3 && hasRoot) {
                    const tabString = tab.join(',');
                    if (!validVoicings.some(v => v.tab.join(',') === tabString)) {
                        validVoicings.push({
                            sys: systemName,
                            name: posName,
                            tab: tab.map(v => v.toString())
                        });
                    }
                }
            };

            // Güvenli ve eksiksiz Açık Akor (Cowboy Chords) tanımları
            if (rootNote === "A") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "0", "2", "2", "2", "0"], "Open", "Açık A Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["x", "0", "2", "2", "1", "0"], "Open", "Açık A Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "0", "2", "0", "2", "0"], "Open", "Açık A7");
                if (chordType === "maj7") evaluateAndPushVoicing(["x", "0", "2", "1", "2", "0"], "Open", "Açık Amaj7");
                if (chordType === "sus4") evaluateAndPushVoicing(["x", "0", "2", "2", "3", "0"], "Open", "Açık Asus4");
                if (chordType === "sus2") evaluateAndPushVoicing(["x", "0", "2", "2", "0", "0"], "Open", "Açık Asus2");
            }
            if (rootNote === "C") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "3", "2", "0", "1", "0"], "Open", "Açık C Majör");
                if (chordType === "maj7") evaluateAndPushVoicing(["x", "3", "2", "0", "0", "0"], "Open", "Açık Cmaj7");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "3", "2", "3", "1", "0"], "Open", "Açık C7");
            }
            if (rootNote === "G") {
                if (chordType === "maj") evaluateAndPushVoicing(["3", "2", "0", "0", "0", "3"], "Open", "Açık G Majör");
                if (chordType === "7")   evaluateAndPushVoicing(["3", "2", "0", "0", "0", "1"], "Open", "Açık G7");
            }
            if (rootNote === "E") {
                if (chordType === "maj") evaluateAndPushVoicing(["0", "2", "2", "1", "0", "0"], "Open", "Açık E Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["0", "2", "2", "0", "0", "0"], "Open", "Açık E Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["0", "2", "0", "1", "0", "0"], "Open", "Açık E7");
                if (chordType === "m7")  evaluateAndPushVoicing(["0", "2", "2", "0", "3", "0"], "Open", "Açık Em7");
            }
            if (rootNote === "D") {
                if (chordType === "maj") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "2"], "Open", "Açık D Majör");
                if (chordType === "m")   evaluateAndPushVoicing(["x", "x", "0", "2", "3", "1"], "Open", "Açık D Minör");
                if (chordType === "7")   evaluateAndPushVoicing(["x", "x", "0", "2", "1", "2"], "Open", "Açık D7");
                if (chordType === "sus4") evaluateAndPushVoicing(["x", "x", "0", "2", "3", "3"], "Open", "Açık Dsus4");
            }

            // Genel Barre / CAGED taraması
            for (let f = 0; f <= 12; f++) {
                if ((openMidiNotes[5] + f) % 12 === rootIndex) {
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const eTab = [
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        chordType.includes('m') ? norm(f + 3) : norm(f + 4), 
                        f, 
                        f
                    ];
                    evaluateAndPushVoicing(eTab.map(String), "CAGED", `E-Formu Barre (${f}. Perde)`);
                }

                if ((openMidiNotes[4] + f) % 12 === rootIndex) {
                    const norm = (val) => (val > 12 ? val - 12 : val);
                    const aTab = [
                        "x", 
                        f, 
                        norm(f + 7), 
                        norm(f + 7), 
                        chordType.includes('m') ? norm(f + 3) : norm(f + 4), 
                        f
                    ];
                    evaluateAndPushVoicing(aTab.map(String), "CAGED", `A-Formu Barre (${f}. Perde)`);
                }
            }

            // Eğer eşleşen voicing bulunamazsa güvenli üçlü (triad) fallback oluştur
            if (validVoicings.length === 0) {
                const safeFret = (rootIndex - (40 % 12) + 12) % 12;
                validVoicings.push({
                    sys: "Fallback",
                    name: "Temel Kök Pozisyon",
                    tab: [safeFret.toString(), "x", "x", safeFret.toString(), "x", "x"]
                });
            }

            return validVoicings;
        } catch (err) {
            console.error("generateVoicings error:", err);
            return [{ sys: "Error", name: "Fallback", tab: ["0","2","2","1","0","0"] }];
        }
    }
