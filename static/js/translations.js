/**
 * Standalone Client-Side Translations & i18n Engine for Vanilla HTML5 / Jinja2 Templates.
 * Supports:
 *   - en: English (Default)
 *   - hi: हिन्दी (Hindi)
 *   - ta: தமிழ் (Tamil)
 */

(function () {
  const translations = {
    en: {
      nav: {
        home: "Home",
        analyze: "Analyze",
        materials: "Materials",
        history: "History",
        monitor: "Monitor",
        skipToContent: "Skip to main content",
        title: "Smart Food Packaging",
        subtitle: "AI & Rule-Based Material Selection",
        brandTitle: "Smart Food Packaging",
        brandTagline: "AI & Rule-Based Material Selection"
      },
      footer: {
        brand: "Smart Food Packaging Recommendation System",
        architecture: "Lightweight CPU architecture running on AMD Ryzen 5 5500U. Domain rules + Scikit-Learn Random Forest.",
        desc: "Lightweight CPU architecture running on AMD Ryzen 5 5500U. Domain rules + Scikit-Learn Random Forest.",
        disclaimer: "Decision-support prototype for food technology and sustainable packaging education. Phase 8 — Final Release.",
        phase: "Decision-support prototype for food technology and sustainable packaging education. Phase 8 — Final Release."
      },
      modal: {
        title: "Analyzing Your Food...",
        subtitle: "Matching food properties with barrier requirements and domain safety rules.",
        step1: "Checking food characteristics",
        step2: "Checking storage requirements",
        step3: "Filtering unsuitable materials with safety rules",
        step4: "Machine-learning candidate assessment",
        step5: "Evaluating packaging compatibility",
        step6: "Preparing your recommendation"
      },
      home: {
        badge: "🌱 Sustainable & AI-Assisted Packaging",
        title: "SMART FOOD PACKAGING\nRECOMMENDATION SYSTEM",
        title1: "SMART FOOD PACKAGING",
        title2: "RECOMMENDATION SYSTEM",
        subtitle: "AI-assisted packaging selection based on food properties, storage conditions, cost, sustainability, and packaging barrier requirements.",
        startBtn: "🚀 Start Analysis",
        startAnalysis: "Start Analysis",
        exploreBtn: "📋 Explore Materials",
        exploreMaterials: "Explore Materials",
        stepsTitle: "How It Works in 3 Simple Steps",
        howItWorksTitle: "How It Works in 3 Simple Steps",
        stepsSubtitle: "Clear, explainable decisions from food properties to final material match.",
        howItWorksSubtitle: "Clear, explainable decisions from food properties to final material match.",
        step1Title: "1. Enter Food Details",
        step1Desc: "Select a preset food or enter moisture, fat, acidity, storage temperature, and desired shelf life.",
        step2Title: "2. Analyze Packaging Needs",
        step2Desc: "Domain safety rules filter unsuitable films, while the CPU machine-learning model evaluates compatibility.",
        step3Title: "3. Understand Recommendation",
        step3Desc: "Review the recommended material, clear reasons why it matches, score breakdowns, and eco/cost alternatives.",
        whyTitle: "Why Use This System?",
        whyRulesTitle: "🛡️ Domain Safety Rules",
        whyRulesDesc: "Hard constraints prevent unsafe recommendations (e.g., bare aluminum on high-acid foods or non-permeable films for respiring fruits).",
        whyMlTitle: "🤖 Machine-Learning Guidance",
        whyMlDesc: "A fast Random Forest model assists candidate scoring based on training patterns, running locally on CPU.",
        whyEcoTitle: "🌿 Sustainability & Cost",
        whySustTitle: "🌿 Sustainability & Cost",
        whyEcoDesc: "Automatically ranks lower-cost and high-recyclability alternatives alongside the primary recommended match.",
        whySustDesc: "Automatically ranks lower-cost and high-recyclability alternatives alongside the primary recommended match.",
        whyExplainTitle: "🔍 100% Explainable",
        whyExplainDesc: "No black-box answers. View exact reasons, barrier values, triggered rules, and literature citations.",
        dataTransTitle: "📊 Data Transparency",
        transparencyTitle: "📊 Data Transparency",
        litDataTitle: "Literature-Backed Data",
        litDataDesc: "Barrier properties sourced from Robertson (2012) and Massey (2003).",
        syntheticDataTitle: "Synthetic Demonstration Data",
        syntheticDataDesc: "ML training records are explicitly labeled as synthetic demonstration data.",
        simulatedDataTitle: "Simulated Sensor Data",
        simulatedDataDesc: "IoT telemetry is generated via simulator. Physical hardware validation is pending.",
        iotTitle: "🌡️ Real-Time Storage Monitoring",
        iotDesc: "After packaging selection, monitor storage conditions in real time. The IoT dashboard tracks temperature, humidity, and CO₂ levels, alerting when conditions drift from the recommended baseline.",
        iotLink: "Open Storage Monitor →",
        methodologyTitle: "💡 Methodology & Performance Note:",
        methodologyDesc: "This application uses verified packaging data from Robertson (2012) and Massey (2003) alongside demonstration synthetic test cases. Compatibility scores reflect project-defined multi-criteria ratings and should not be used as clinical shelf-life certification. Designed for CPU execution on AMD Ryzen 5 5500U."
      },
      analyze: {
        pageTitle: "Food & Packaging Analysis",
        pageSubtitle: "Enter food properties, storage conditions, and optimization goals to evaluate optimal packaging materials.",
        step1Title: "1. What are you packaging?",
        step1Desc: "Choose a standard food commodity or enter your own custom food.",
        presetLabel: "⚡ Quick-Start: Load a Known Food Preset",
        loadPresetBtn: "Load Preset",
        foodNameLabel: "Food Product Name",
        foodNamePlaceholder: "e.g., Crisp Potato Chips",
        categoryLabel: "Food Category",
        nextBtn: "Next: Food Properties →",
        step2Title: "2. Food Characteristics",
        step2Desc: "Physical composition determines moisture barriers, fat oxidation risks, and acidity constraints.",
        moistureLabel: "Moisture Content (%)",
        fatLabel: "Fat & Oil Content (%)",
        phLabel: "Acidity Level (pH)",
        respirationLabel: "Respiration Activity",
        step3Title: "3. Storage & Shelf Life",
        shelfLifeLabel: "Desired Shelf Life (days)",
        tempLabel: "Storage Temperature (°C)",
        rhLabel: "Relative Humidity (%)",
        storageTypeLabel: "Storage Environment",
        step4Title: "4. Sensitivities & Preferences",
        o2SensitivityLabel: "Oxygen Sensitivity",
        moistureSensitivityLabel: "Moisture Sensitivity",
        lightSensitivityLabel: "Light Sensitivity",
        submitBtn: "Run Full Packaging Analysis 🚀",
        prevBtn: "← Back"
      },
      compare: {
        badge: "Materials Catalog Matrix",
        pageTitle: "Compare Packaging Materials",
        pageSubtitle: "Explore and compare barrier properties, strength, recyclability, and cost across our database.",
        searchPlaceholder: "🔍 Search materials by name or polymer type...",
        filterAll: "All",
        filterFilm: "Flexible Film",
        filterLaminate: "Multi-layer Laminate",
        filterBio: "Bio-polymer",
        filterPaper: "Paperboard",
        filterGlass: "Glass",
        toggleTech: "Show Technical Details",
        selectionTip: "Select 2 to 4 materials using checkboxes for side-by-side technical comparison.",
        clearBtn: "Clear",
        compareBtn: "Compare Side-by-Side",
        syntheticBadge: "Synthetic Demonstration Data",
        litBadge: "Literature-Backed"
      },
      history: {
        pageTitle: "Recommendation History",
        pageSubtitle: "Review past packaging analysis runs, profiles, and compatibility scores.",
        searchPlaceholder: "🔍 Search by food name or #ID...",
        newAnalysisBtn: "➕ New Analysis"
      },
      monitor: {
        pageTitle: "Storage Condition Monitor",
        pageSubtitle: "Real-time environmental monitoring against packaging analysis assumptions.",
        tempGauge: "Temperature",
        humGauge: "Humidity",
        co2Gauge: "Carbon Dioxide",
        condition: "Condition"
      },
      report: {
        pageTitle: "Packaging Evaluation Report",
        printBtn: "🖨️ Print / Save PDF"
      }
    },

    hi: {
      nav: {
        home: "होम",
        analyze: "विश्लेषण",
        materials: "सामग्री सूची",
        history: "इतिहास",
        monitor: "निगरानी",
        skipToContent: "मुख्य सामग्री पर जाएं",
        title: "स्मार्ट फूड पैकेजिंग",
        subtitle: "एआई और नियम-आधारित पैकेजिंग चयन",
        brandTitle: "स्मार्ट फूड पैकेजिंग",
        brandTagline: "एआई और नियम-आधारित पैकेजिंग चयन"
      },
      footer: {
        brand: "स्मार्ट फूड पैकेजिंग अनुशंसा प्रणाली",
        architecture: "AMD Ryzen 5 5500U पर आधारित हल्का CPU आर्किटेक्चर। डोमेन नियम + Scikit-Learn रैंडम फॉरेस्ट।",
        desc: "AMD Ryzen 5 5500U पर आधारित हल्का CPU आर्किटेक्चर। डोमेन नियम + Scikit-Learn रैंडम फॉरेस्ट।",
        disclaimer: "खाद्य प्रौद्योगिकी और सतत पैकेजिंग शिक्षा के लिए निर्णय-सहायक प्रोटोटाइप। चरण 8 — अंतिम रिलीज़।",
        phase: "खाद्य प्रौद्योगिकी और सतत पैकेजिंग शिक्षा के लिए निर्णय-सहायक प्रोटोटाइप। चरण 8 — अंतिम रिलीज़।"
      },
      modal: {
        title: "खाद्य उत्पाद का विश्लेषण हो रहा है...",
        subtitle: "खाद्य विशेषताओं को बैरियर आवश्यकताओं और सुरक्षा नियमों के साथ मिलाया जा रहा है।",
        step1: "खाद्य विशेषताओं की जांच की जा रही है",
        step2: "भंडारण आवश्यकताओं की पुष्टि हो रही है",
        step3: "सुरक्षा नियमों द्वारा अनुपयुक्त सामग्रियों को छांटा जा रहा है",
        step4: "मशीन लर्निंग मॉडल द्वारा अनुकूलता मूल्यांकन",
        step5: "पैकेजिंग अनुकूलता स्कोर का विश्लेषण",
        step6: "आपकी पैकेजिंग अनुशंसा तैयार हो रही है"
      },
      home: {
        badge: "🌱 सतत और एआई-संचालित पैकेजिंग",
        title: "स्मार्ट फूड पैकेजिंग\nअनुशंसा प्रणाली",
        title1: "स्मार्ट फूड पैकेजिंग",
        title2: "अनुशंसा प्रणाली",
        subtitle: "खाद्य गुणों, भंडारण स्थितियों, लागत, स्थिरता और पैकेजिंग अवरोधक आवश्यकताओं पर आधारित एआई-सहायता प्राप्त सामग्री चयन।",
        startBtn: "🚀 विश्लेषण शुरू करें",
        startAnalysis: "विश्लेषण शुरू करें",
        exploreBtn: "📋 सामग्रियों का अन्वेषण करें",
        exploreMaterials: "सामग्रियों का अन्वेषण करें",
        stepsTitle: "यह 3 सरल चरणों में कैसे काम करता है",
        howItWorksTitle: "यह 3 सरल चरणों में कैसे काम करता है",
        stepsSubtitle: "खाद्य गुणों से लेकर अंतिम सामग्री चयन तक स्पष्ट और पारदर्शी निर्णय।",
        howItWorksSubtitle: "खाद्य गुणों से लेकर अंतिम सामग्री चयन तक स्पष्ट और पारदर्शी निर्णय।",
        step1Title: "1. भोजन का विवरण दर्ज करें",
        step1Desc: "पहले से मौजूद खाद्य चुनें या नमी, वसा, अम्लता, तापमान और शेल्फ लाइफ दर्ज करें।",
        step2Title: "2. पैकेजिंग जरूरतों का विश्लेषण",
        step2Desc: "डोमेन सुरक्षा नियम अनुपयुक्त फिल्मों को हटाते हैं, जबकि सीपीयू मशीन लर्निंग अनुकूलता का परीक्षण करती है।",
        step3Title: "3. अनुशंसा और कारण समझें",
        step3Desc: "अनुशंसित सामग्री, चयन के स्पष्ट कारण, स्कोर विवरण और पर्यावरण-अनुकूल विकल्प देखें।",
        whyTitle: "इस प्रणाली का उपयोग क्यों करें?",
        whyRulesTitle: "🛡️ डोमेन सुरक्षा नियम",
        whyRulesDesc: "कठोर नियम असुरक्षित अनुशंसाओं को रोकते हैं (जैसे अधिक अम्लीय भोजन पर एल्यूमीनियम या श्वसन वाले फलों पर अभेद्य फिल्में)।",
        whyMlTitle: "🤖 मशीन लर्निंग मार्गदर्शन",
        whyMlDesc: "प्रशिक्षण पैटर्न के आधार पर सामग्री चयन में सहायता करने वाला तेज़ रैंडम फॉरेस्ट मॉडल, जो स्थानीय सीपीयू पर चलता है।",
        whyEcoTitle: "🌿 स्थिरता और लागत संतुलन",
        whySustTitle: "🌿 स्थिरता और लागत संतुलन",
        whyEcoDesc: "मुख्य अनुशंसा के साथ-साथ कम लागत और उच्च-पुनर्चक्रण वाले विकल्पों को स्वतः रैंक करता है।",
        whySustDesc: "मुख्य अनुशंसा के साथ-साथ कम लागत और उच्च-पुनर्चक्रण वाले विकल्पों को स्वतः रैंक करता है।",
        whyExplainTitle: "🔍 100% स्पष्ट और पारदर्शी",
        whyExplainDesc: "कोई गुप्त जवाब नहीं। सटीक कारण, अवरोधक मान, सक्रिय नियम और वैज्ञानिक संदर्भ देखें।",
        dataTransTitle: "📊 डेटा पारदर्शिता",
        transparencyTitle: "📊 डेटा पारदर्शिता",
        litDataTitle: "साहित्य-समर्थित डेटा",
        litDataDesc: "रॉबर्टसन (2012) और मैसी (2003) से प्राप्त बैरियर गुण।",
        syntheticDataTitle: "सिंथेटिक प्रदर्शन डेटा",
        syntheticDataDesc: "मशीन लर्निंग प्रशिक्षण रिकॉर्ड स्पष्ट रूप से सिंथेटिक प्रदर्शन डेटा के रूप में चिह्नित हैं।",
        simulatedDataTitle: "सिम्युलेटेड सेंसर डेटा",
        simulatedDataDesc: "IoT टेलीमेट्री सिम्युलेटर के माध्यम से उत्पन्न होती है। भौतिक हार्डवेयर सत्यापन लंबित है।",
        iotTitle: "🌡️ रीयल-टाइम स्टोरेज निगरानी",
        iotDesc: "पैकेजिंग चयन के बाद, वास्तविक समय में भंडारण स्थितियों की निगरानी करें। IoT डैशबोर्ड तापमान, आर्द्रता और CO₂ स्तरों को ट्रैक करता है।",
        iotLink: "स्टोरेज मॉनिटर खोलें →",
        methodologyTitle: "💡 कार्यप्रणाली और प्रदर्शन नोट:",
        methodologyDesc: "यह अनुप्रयोग रॉबर्टसन (2012) और मैसी (2003) के सत्यापित पैकेजिंग डेटा के साथ-साथ प्रदर्शन सिंथेटिक परीक्षण मामलों का उपयोग करता है। संगतता स्कोर परियोजना-निर्धारित बहु-मानदंड रेटिंग को दर्शाते हैं। AMD Ryzen 5 5500U पर CPU निष्पादन के लिए डिज़ाइन किया गया।"
      },
      analyze: {
        pageTitle: "खाद्य एवं पैकेजिंग विश्लेषण",
        pageSubtitle: "इष्टतम पैकेजिंग सामग्री का मूल्यांकन करने के लिए खाद्य गुण, भंडारण स्थिति और लक्ष्य दर्ज करें।",
        step1Title: "1. भोजन का विवरण",
        step1Desc: "पहले से मौजूद खाद्य चुनें या अपना उत्पाद दर्ज करें।",
        presetLabel: "⚡ पहले से मौजूद खाद्य प्रीसेट लोड करें",
        loadPresetBtn: "प्रीसेट लागू करें",
        foodNameLabel: "खाद्य उत्पाद का नाम",
        foodNamePlaceholder: "उदा. आलू के चिप्स, स्ट्रॉबेरी, पनीर",
        categoryLabel: "खाद्य श्रेणी",
        nextBtn: "अगला: खाद्य गुण →",
        step2Title: "2. खाद्य विशेषताएं और गुण",
        step2Desc: "भौतिक संरचना नमी और ऑक्सीजन अवरोधक आवश्यकताओं को निर्धारित करती है।",
        moistureLabel: "नमी की मात्रा (%)",
        fatLabel: "वसा और तेल की मात्रा (%)",
        phLabel: "अम्लता स्तर (pH)",
        respirationLabel: "श्वसन दर (Respiration Activity)",
        step3Title: "3. भंडारण एवं शेल्फ लाइफ",
        shelfLifeLabel: "वांछित शेल्फ लाइफ (दिन)",
        tempLabel: "भंडारण तापमान (°C)",
        rhLabel: "सापेक्ष आर्द्रता (%)",
        storageTypeLabel: "भंडारण वातावरण",
        step4Title: "4. संवेदनशीलता और प्राथमिकताएं",
        o2SensitivityLabel: "ऑक्सीजन संवेदनशीलता",
        moistureSensitivityLabel: "नमी संवेदनशीलता",
        lightSensitivityLabel: "प्रकाश संवेदनशीलता",
        submitBtn: "संपूर्ण पैकेजिंग विश्लेषण चलाएं 🚀",
        prevBtn: "← पीछे"
      },
      compare: {
        badge: "सामग्री कैटलॉग मैट्रिक्स",
        pageTitle: "पैकेजिंग सामग्रियों की तुलना",
        pageSubtitle: "हमारे डेटाबेस में सामग्रियों के बैरियर गुण, मजबूती, पुनर्चक्रण और लागत की तुलना करें।",
        searchPlaceholder: "🔍 नाम या पॉलीमर के प्रकार से सामग्री खोजें...",
        filterAll: "सभी",
        filterFilm: "लचीली फिल्म",
        filterLaminate: "मल्टी-लेयर लैमिनेट",
        filterBio: "बायो-पॉलिमर",
        filterPaper: "पेपरबोर्ड",
        filterGlass: "कांच",
        toggleTech: "तकनीकी विवरण दिखाएं",
        selectionTip: "आमने-सामने तुलना के लिए चेकबॉक्स का उपयोग करके 2 से 4 सामग्री चुनें।",
        clearBtn: "साफ़ करें",
        compareBtn: "📊 तुलना करें",
        syntheticBadge: "सिंथेटिक प्रदर्शन डेटा",
        litBadge: "साहित्य-समर्थित"
      },
      history: {
        pageTitle: "अनुशंसा इतिहास",
        pageSubtitle: "पिछले पैकेजिंग विश्लेषणों, प्रोफाइल और अनुकूलता स्कोर की समीक्षा करें।",
        searchPlaceholder: "🔍 भोजन के नाम या #ID से खोजें...",
        newAnalysisBtn: "➕ नया विश्लेषण"
      },
      monitor: {
        pageTitle: "रीयल-टाइम स्टोरेज मॉनिटर",
        pageSubtitle: "पैकेज्ड फूड लॉट के लिए तापमान, सापेक्ष आर्द्रता और CO₂ की लाइव सेंसर निगरानी।",
        tempGauge: "तापमान",
        humGauge: "सापेक्ष आर्द्रता",
        co2Gauge: "कार्बन डाइऑक्साइड",
        condition: "स्थिति"
      },
      report: {
        pageTitle: "पैकेजिंग मूल्यांकन रिपोर्ट",
        printBtn: "🖨️ प्रिंट करें / PDF सहेजें"
      }
    },

    ta: {
      nav: {
        home: "முகப்பு",
        analyze: "பகுப்பாய்வு",
        materials: "பொருட்கள்",
        history: "வரலாறு",
        monitor: "கண்காணிப்பு",
        skipToContent: "முதன்மை உள்ளடக்கத்திற்கு செல்க",
        title: "ஸ்மார்ட் உணவு பேக்கேஜிங்",
        subtitle: "AI மற்றும் விதி அடிப்படையிலான பொருள் தேர்வு",
        brandTitle: "ஸ்மார்ட் உணவு பேக்கேஜிங்",
        brandTagline: "AI மற்றும் விதி அடிப்படையிலான பொருள் தேர்வு"
      },
      footer: {
        brand: "ஸ்மார்ட் உணவு பேக்கேஜிங் பரிந்துரை அமைப்பு",
        architecture: "AMD Ryzen 5 5500U இல் இயங்கும் இலகுரக CPU கட்டமைப்பு. டொமைன் விதிகள் + Scikit-Learn ரேண்டம் பாரஸ்ட்.",
        desc: "AMD Ryzen 5 5500U இல் இயங்கும் இலகுரக CPU கட்டமைப்பு. டொமைன் விதிகள் + Scikit-Learn ரேண்டம் பாரஸ்ட்.",
        disclaimer: "உணவுத் தொழில்நுட்பம் மற்றும் நிலையான பேக்கேஜிங் கல்விக்கான முடிவு ஆதரவு முன்மாதிரி. கட்டம் 8 — இறுதி வெளியீடு.",
        phase: "உணவுத் தொழில்நுட்பம் மற்றும் நிலையான பேக்கேஜிங் கல்விக்கான முடிவு ஆதரவு முன்மாதிரி. கட்டம் 8 — இறுதி வெளியீடு."
      },
      modal: {
        title: "உங்கள் உணவு பகுப்பாய்வு செய்யப்படுகிறது...",
        subtitle: "உணவு பண்புகள் பாதுகாப்பு விதிகள் மற்றும் தடை தேவைகளுடன் ஒப்பிடப்படுகின்றன.",
        step1: "உணவு பண்புகளை சரிபார்க்கிறது",
        step2: "சேமிப்பு தேவைகளை உறுதிப்படுத்துகிறது",
        step3: "பாதுகாப்பற்ற பொருட்களை விதிகளின்படி நீக்குகிறது",
        step4: "இயந்திர கற்றல் மாதிரி மதிப்பீடு",
        step5: "பேக்கேஜிங் பொருந்தக்கூடிய தன்மையை மதிப்பிடுகிறது",
        step6: "உங்கள் பரிந்துரையைத் தயாரிக்கிறது"
      },
      home: {
        badge: "🌱 நிலையான & AI-உதவி பேக்கேஜிங்",
        title: "ஸ்மார்ட் உணவு பேக்கேஜிங்\nபரிந்துரை அமைப்பு",
        title1: "ஸ்மார்ட் உணவு பேக்கேஜிங்",
        title2: "பரிந்துரை அமைப்பு",
        subtitle: "உணவு பண்புகள், சேமிப்பு நிலைமைகள், செலவு, நிலைத்தன்மை மற்றும் பேக்கேஜிங் தடை தேவைகளின் அடிப்படையில் AI-உதவி பொருள் தேர்வு.",
        startBtn: "🚀 பகுப்பாய்வைத் தொடங்கு",
        startAnalysis: "பகுப்பாய்வைத் தொடங்கு",
        exploreBtn: "📋 பொருட்களை ஆராய்க",
        exploreMaterials: "பொருட்களை ஆராய்க",
        stepsTitle: "3 எளிய படிகளில் இது எவ்வாறு செயல்படுகிறது",
        howItWorksTitle: "3 எளிய படிகளில் இது எவ்வாறு செயல்படுகிறது",
        stepsSubtitle: "உணவு பண்புகள் முதல் இறுதி பேக்கேஜிங் வரை தெளிவான, விளக்கக்கூடிய முடிவுகள்.",
        howItWorksSubtitle: "உணவு பண்புகள் முதல் இறுதி பேக்கேஜிங் வரை தெளிவான, விளக்கக்கூடிய முடிவுகள்.",
        step1Title: "1. உணவு விவரங்களை உள்ளிடவும்",
        step1Desc: "முன்னமைக்கப்பட்ட உணவைத் தேர்ந்தெடுக்கவும் அல்லது ஈரப்பதம், கொழுப்பு, அமிலத்தன்மை மற்றும் சேமிப்பு வெப்பநிலையை உள்ளிடவும்.",
        step2Title: "2. பேக்கேஜிங் தேவைகளை பகுப்பாய்வு செய்தல்",
        step2Desc: "பாதுகாப்பு விதிகள் பொருந்தாத பிலிம்களை வடிகட்டுகின்றன, CPU இயந்திர கற்றல் பொருந்தக்கூடிய தன்மையை மதிப்பிடுகிறது.",
        step3Title: "3. பரிந்துரையைப் புரிந்து கொள்ளுங்கள்",
        step3Desc: "பரிந்துரைக்கப்பட்ட பொருள், பொருந்துவதற்கான தெளிவான காரணங்கள், மதிப்பெண் விவரங்கள் மற்றும் குறைந்த செலவு மாற்றுகளைப் பார்க்கவும்.",
        whyTitle: "இந்த அமைப்பை ஏன் பயன்படுத்த வேண்டும்?",
        whyRulesTitle: "🛡️ பாதுகாப்பு விதிகள்",
        whyRulesDesc: "கடுமையான கட்டுப்பாடுகள் பாதுகாப்பற்ற பரிந்துரைகளைத் தடுக்கின்றன (எ.கா. அதிக அமில உணவுகளில் வெற்று அலுமினியம் அல்லது சுவாசிக்கும் பழங்களில் காற்றுப் புகாத பிலிம்கள்).",
        whyMlTitle: "🤖 இயந்திர கற்றல் வழிகாட்டுதல்",
        whyMlDesc: "உள்ளூர் CPU இல் இயங்கும் அதிவேக ரேண்டம் பாரஸ்ட் மாதிரி, வரலாற்றுத் தரவுகளின் அடிப்படையில் பொருட்களைத் தேர்ந்தெடுக்க உதவுகிறது.",
        whyEcoTitle: "🌿 நிலைத்தன்மை & செலவு திறன்",
        whySustTitle: "🌿 நிலைத்தன்மை & செலவு திறன்",
        whyEcoDesc: "முதன்மை பரிந்துரையுடன் குறைந்த செலவு மற்றும் அதிக மறுசுழற்சி மாற்றுப் பொருட்களை தானாகவே வரிசைப்படுத்துகிறது.",
        whySustDesc: "முதன்மை பரிந்துரையுடன் குறைந்த செலவு மற்றும் அதிக மறுசுழற்சி மாற்றுப் பொருட்களை தானாகவே வரிசைப்படுத்துகிறது.",
        whyExplainTitle: "🔍 100% விளக்கக்கூடியது",
        whyExplainDesc: "மறைமுக பதில்கள் இல்லை. துல்லியமான காரணங்கள், தடை மதிப்புகள், இயக்கப்பட்ட விதிகள் மற்றும் அறிவியல் மேற்கோள்களைக் காண்க.",
        dataTransTitle: "📊 தரவு வெளிப்படைத்தன்மை",
        transparencyTitle: "📊 தரவு வெளிப்படைத்தன்மை",
        litDataTitle: "அறிவியல் இலக்கிய ஆதரவு தரவு",
        litDataDesc: "ராபர்ட்சன் (2012) மற்றும் மாஸ்ஸி (2003) மூலங்களிலிருந்து பெறப்பட்ட தடை பண்புகள்.",
        syntheticDataTitle: "செயற்கை செயல்விளக்க தரவு",
        syntheticDataDesc: "இயந்திர கற்றல் பயிற்சி பதிவுகள் செயற்கை செயல்விளக்க தரவுகளாக வெளிப்படையாக பெயரிடப்பட்டுள்ளன.",
        simulatedDataTitle: "உருவகப்படுத்தப்பட்ட சென்சார் தரவு",
        simulatedDataDesc: "IoT தொலை அளவீடு சிமுலேட்டர் வழியாக உருவாக்கப்படுகிறது. இயற்பியல் வன்பொருள் சரிபார்ப்பு நிலுவையில் உள்ளது.",
        iotTitle: "🌡️ நிகழ்நேர சேமிப்பு கண்காணிப்பு",
        iotDesc: "பேக்கேஜிங் தேர்வுக்குப் பிறகு, உண்மையான நேரத்தில் சேமிப்பு நிலைமைகளைக் கண்காணிக்கவும். IoT டாஷ்போர்டு வெப்பநிலை, ஈரப்பதம் மற்றும் CO₂ அளவைக் கண்காணிக்கிறது.",
        iotLink: "சேமிப்பு மானிட்டரைத் திறக்கவும் →",
        methodologyTitle: "💡 முறை மற்றும் செயல்திறன் குறிப்பு:",
        methodologyDesc: "இந்த பயன்பாடு ராபர்ட்சன் (2012) மற்றும் மாஸ்ஸி (2003) ஆகியவற்றின் சரிபார்க்கப்பட்ட பேக்கேஜிங் தரவுகளையும் செயற்கை மாதிரி வழக்குகளையும் பயன்படுத்துகிறது. AMD Ryzen 5 5500U இல் CPU இயக்கத்திற்காக வடிவமைக்கப்பட்டது."
      },
      analyze: {
        pageTitle: "உணவு & பேக்கேஜிங் பகுப்பாய்வு",
        pageSubtitle: "உகந்த பேக்கேஜிங் பொருட்களை மதிப்பீடு செய்ய உணவு பண்புகள், சேமிப்பு நிலைமைகள் மற்றும் இலக்குகளை உள்ளிடவும்.",
        step1Title: "1. உணவு விவரங்கள்",
        step1Desc: "முன்பே கட்டமைக்கப்பட்ட உணவுப் பொருளைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் சொந்த உணவை உள்ளிடவும்.",
        presetLabel: "⚡ முன்னமைக்கப்பட்ட உணவைத் தேர்ந்தெடுக்கவும்",
        loadPresetBtn: "பயன்படுத்து",
        foodNameLabel: "உணவுப் பொருளின் பெயர்",
        foodNamePlaceholder: "எ.கா. உருளைக்கிழங்கு சிப்ஸ், ஸ்ட்ராபெர்ரி, சீஸ்",
        categoryLabel: "உணவு வகை",
        nextBtn: "அடுத்தது: உணவு பண்புகள் →",
        step2Title: "2. பண்புகள் & சுவாசம்",
        step2Desc: "ஈரப்பதம் மற்றும் ஆக்ஸிஜன் இழப்பை தீர்மானிக்கும் உள்ளார்ந்த உணவு பண்புகளைக் குறிப்பிடவும்.",
        moistureLabel: "ஈரப்பதம் (%)",
        fatLabel: "கொழுப்பு அளவு (%)",
        phLabel: "அமிலத்தன்மை (pH அளவு)",
        respirationLabel: "சுவாச விகிதம் (Respiration Activity)",
        step3Title: "3. சேமிப்பு & தளவாடங்கள்",
        shelfLifeLabel: "விரும்பிய அடுக்கு வாழ்க்கை (நாட்கள்)",
        tempLabel: "சேமிப்பு வெப்பநிலை (°C)",
        rhLabel: "ஒப்பீட்டு ஈரப்பதம் (%)",
        storageTypeLabel: "சேமிப்பு முறை",
        step4Title: "4. உணர்திறன் மற்றும் விருப்பங்கள்",
        o2SensitivityLabel: "ஆக்ஸிஜன் உணர்திறன்",
        moistureSensitivityLabel: "ஈரப்பதம் உணர்திறன்",
        lightSensitivityLabel: "ஒளி உணர்திறன்",
        submitBtn: "முழு பேக்கேஜிங் பகுப்பாய்வை இயக்கு 🚀",
        prevBtn: "← பின்செல்"
      },
      compare: {
        badge: "பொருட்கள் பட்டியல் அணிவரிசை",
        pageTitle: "பேக்கேஜிங் பொருட்களை ஒப்பிடுக",
        pageSubtitle: "எங்கள் தரவுத்தளத்தில் உள்ள பொருட்களின் தடை பண்புகள், வலிமை, மறுசுழற்சி மற்றும் செலவை ஒப்பிடுக.",
        searchPlaceholder: "🔍 பெயர் அல்லது பாலிமர் வகை மூலம் தேடுக...",
        filterAll: "அனைத்தும்",
        filterFilm: "நெகிழ்வு பிலிம்",
        filterLaminate: "பல அடுக்கு லேமினேட்",
        filterBio: "உயிர்-பாலிமர்",
        filterPaper: "அட்டைப்பெட்டி",
        filterGlass: "கண்ணாடி",
        toggleTech: "தொழில்நுட்ப விவரங்களைக் காட்டு",
        selectionTip: "ஒப்பீடு செய்ய தேர்வுப்பெட்டிகளைப் பயன்படுத்தி 2 முதல் 4 பொருட்களைத் தேர்ந்தெடுக்கவும்.",
        clearBtn: "அழி",
        compareBtn: "📊 அருகருகே ஒப்பிடுக",
        syntheticBadge: "செயற்கை செயல்விளக்க தரவு",
        litBadge: "அறிவியல் ஆதரவு பெற்றது"
      },
      history: {
        pageTitle: "பரிந்துரை வரலாறு",
        pageSubtitle: "கடந்த பேக்கேஜிங் பகுப்பாய்வுகள், சுயவிவரங்கள் மற்றும் மதிப்பெண்களை மதிப்பாய்வு செய்யவும்.",
        searchPlaceholder: "🔍 உணவு பெயர் அல்லது #ID மூலம் தேடுக...",
        newAnalysisBtn: "➕ புதிய பகுப்பாய்வு"
      },
      monitor: {
        pageTitle: "நேரடி சேமிப்பு கண்காணிப்பு",
        pageSubtitle: "பேக்கேஜ் செய்யப்பட்ட உணவுப் பொருட்களுக்கான வெப்பநிலை, ஈரப்பதம் மற்றும் CO₂ இன் நேரடி சென்சார் கண்காணிப்பு.",
        tempGauge: "வெப்பநிலை",
        humGauge: "ஈரப்பதம்",
        co2Gauge: "கார்பன் டை ஆக்சைடு",
        condition: "நிலை"
      },
      report: {
        pageTitle: "பேக்கேஜிங் மதிப்பீட்டு அறிக்கை",
        printBtn: "🖨️ அச்சிடுக / PDF ஆக சேமி"
      }
    }
  };

  const I18N = {
    lang: localStorage.getItem('packaging_sys_lang') || localStorage.getItem('lang') || 'en',
    translations: translations,

    t: function (path, fallback) {
      if (!path) return fallback || '';
      const parts = path.split('.');
      let cur = translations[this.lang];
      for (let p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p];
        } else {
          cur = null;
          break;
        }
      }
      if (cur === null || cur === undefined) {
        let enCur = translations.en;
        for (let p of parts) {
          if (enCur && typeof enCur === 'object' && p in enCur) {
            enCur = enCur[p];
          } else {
            enCur = null;
            break;
          }
        }
        return enCur !== null && enCur !== undefined ? enCur : fallback || path;
      }
      return cur;
    },

    setLang: function (newLang) {
      if (translations[newLang]) {
        this.lang = newLang;
        localStorage.setItem('packaging_sys_lang', newLang);
        localStorage.setItem('lang', newLang);
        document.documentElement.setAttribute('lang', newLang);
        this.apply();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
      }
    },

    apply: function () {
      document.documentElement.setAttribute('lang', this.lang);
      
      // Update data-i18n text content
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (translated) {
          el.textContent = translated;
        }
      });

      // Update data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = this.t(key);
        if (translated) {
          el.setAttribute('placeholder', translated);
        }
      });

      // Sync select dropdown if present
      const select = document.getElementById('lang-select');
      if (select && select.value !== this.lang) {
        select.value = this.lang;
      }
    },

    init: function () {
      const select = document.getElementById('lang-select');
      if (select) {
        select.value = this.lang;
        select.addEventListener('change', (e) => {
          this.setLang(e.target.value);
        });
      }
      this.apply();
    }
  };

  window.I18N = I18N;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
  } else {
    I18N.init();
  }
})();
