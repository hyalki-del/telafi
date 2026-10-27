export const scaleTiers = {
    "Start": {
        "Minor Triad": { intervals: [0, 3, 7], formula: "1 - b3 - 5", desc: "<b>Minör Üçlü (Minor Triad):</b> Kök, minör 3'lü ve tam 5'li seslerinden oluşur. Hüzünlü ve kararlı bir temel yapı sunar." },
        "Major Triad": { intervals: [0, 4, 7], formula: "1 - 3 - 5", desc: "<b>Majör Üçlü (Major Triad):</b> Kök, majör 3'lü ve tam 5'li seslerinden oluşur. Parlak ve güçlü akor temelidir." },
        "Minor Pentatonic": { intervals: [0, 3, 5, 7, 10], formula: "1 - b3 - 4 - 5 - b7", desc: "<b>Minör Pentatonik Gam:</b> Gitaristlerin en çok kullandığı 5 sesli gamdır. Solo ve doğaçlama çalışmalarının vazgeçilmezidir." },
        "Major Pentatonic": { intervals: [0, 2, 4, 7, 9], formula: "1 - 2 - 3 - 5 - 6", desc: "<b>Majör Pentatonik Gam:</b> Neşeli, akıcı ve melodik tonlar sunan 5 sesli popüler gam yapısıdır." }
    },
    "Understand": {
        "Natural Minor": { intervals: [0, 2, 3, 5, 7, 8, 10], formula: "1 - 2 - b3 - 4 - 5 - b6 - b7", desc: "<b>Doğal Minör (Aeolian):</b> Klasik minör gamdır. Dramatik, derin ve melankolik bir atmosfer yaratır." },
        "Major Scale": { intervals: [0, 2, 4, 5, 7, 9, 11], formula: "1 - 2 - 3 - 4 - 5 - 6 - 7", desc: "<b>İyonian (Majör Gam):</b> Batı müziğinin temel taşıdır. Oldukça aydınlık, açık ve dengeli bir tınıya sahiptir." },
        "Blues Scale": { intervals: [0, 3, 5, 6, 7, 10], formula: "1 - b3 - 4 - b5 - 5 - b7", desc: "<b>Blues Gamı:</b> Minör pentatoniğe eklenen 'Blue Note' (b5) ile blues müziğin o dertli ve esnek hissiyatını verir." },
        "Mixolydian": { intervals: [0, 2, 4, 5, 7, 9, 10], formula: "1 - 2 - 3 - 4 - 5 - 6 - b7", desc: "<b>Miksolidyen Modu:</b> Dominant 7'li akorlar üzerinde kullanılan, blues ve rock müzikte çokça duyulan karakteristik gamdır." }
    },
    "Advance": {
        "Harmonic Minor": { intervals: [0, 2, 3, 5, 7, 8, 11], formula: "1 - 2 - b3 - 4 - 5 - b6 - 7", desc: "<b>Armonik Minör:</b> 7. derecesi tizleştirilmiş (major 7) gizemli, doğu ezgilerine ve neoklasik tarzlara göz kırpan bir gamdır." },
        "Dorian Mode": { intervals: [0, 2, 3, 5, 7, 9, 10], formula: "1 - 2 - b3 - 4 - 5 - 6 - b7", desc: "<b>Doryen Modu:</b> Caz ve funk müzikte sıklıkla tercih edilen, minör yapıya sahip ama daha cazibe dolu bir moddur." },
        "Major Blues": { intervals: [0, 2, 3, 4, 7, 9], formula: "1 - 2 - b3 - 3 - 5 - 6", desc: "<b>Majör Blues Gamı:</b> Majör pentatoniğin içine eklenen minör 3'lü (b3) geçişiyle blues ruhunu majör tarafa taşır." },
        "Diminished (7th)": { intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7", desc: "<b>Tam Eksilmiş Gam:</b> Simetrik yapısı sayesinde sürekli gerilim üreten ve üst üste tırmanma hissi veren bir gamdır." }
    }
};
