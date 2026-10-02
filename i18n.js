/*!
 * Redliners Performance — language switcher (English / Srpski / Български)
 *
 * English lives in the HTML itself. Any element marked data-i18n="key" has its
 * English innerHTML captured on load and swapped for the matching translation.
 * Attributes are translated with data-i18n-attr="attr:key;attr2:key2".
 * Strings used only by scripts (stage selector, e-mail subject, number format)
 * live in DICT.<lang> and are read with RL_I18N.t(key).
 *
 * The visitor's choice is remembered (localStorage) and can be forced with ?lang=sr|bg|en.
 */
(function () {
  'use strict';

  const LANGS = {
    en: { html: 'en',      locale: 'en-US',      name: 'English' },
    sr: { html: 'sr-Latn', locale: 'sr-Latn-RS', name: 'Srpski' },
    bg: { html: 'bg',      locale: 'bg-BG',      name: 'Български' }
  };

  const DICT = {
    /* ---------------- English: script-only strings ---------------- */
    en: {
      'mail.subject': 'Remap booking — ',
      'cc.waText': "Hi Redliners Performance, I'd like to ask about a remap for my vehicle.",
      'th.hi': 'Thank you, {name}!',
      'th.plain': 'Thank you!',
      'th.body': 'Your request for {service} — {vehicle} — is in. We\'ll get back to you at {phone} shortly with a plan and a dyno slot.',
      'th.auto': 'Returning to the website in {s} s',
      'bk.sending': 'Sending…',
      'mail.auto': 'Thank you for your request ({ref}). We have received it and will contact you shortly. — Redliners Performance, +381 63 481 566',
      stages: [
        { tag: 'Software only', title: 'Stage 1 — Daily weapon',
          desc: 'Optimised boost, fuelling and timing on completely stock hardware. Sharper response, a fatter torque curve and often better motorway economy.',
          list: ['Custom map from your original file', 'Before/after dyno run', 'Original file archived', 'Health check & datalog'] },
        { tag: 'Bolt-ons + software', title: 'Stage 2 — Breathe harder',
          desc: 'Calibration built around supporting hardware so the engine can move more air and shed heat consistently, run after run.',
          list: ['Upgraded intake & downpipe', 'Bigger intercooler', 'Clutch / TCU torque limits raised', 'Multi-run dyno validation'] },
        { tag: 'Hardware build', title: 'Stage 3 — Full send',
          desc: 'Hybrid or larger turbo, fuelling and drivetrain upgrades — a bespoke build calibrated from scratch for maximum reliable output.',
          list: ['Hybrid / big turbo', 'Injectors & fuel pump', 'Gearbox calibration & clutch', 'Track & launch strategies'] }
      ]
    },

    /* ---------------- Srpski (latinica) ---------------- */
    sr: {
      'meta.description': 'Redliners Performance — profesionalno ECU, TCU i DCU reprogramiranje, Stage 1–3 tjuning proveren na dyno-u, dijagnostika i DPF/EGR/AdBlue rešenja za automobile, kamione i poljoprivrednu mehanizaciju.',
      'mail.subject': 'Zahtev za termin — ',

      'nav.services': 'Usluge', 'nav.dyno': 'Dyno', 'nav.stages': 'Stage paketi', 'nav.gallery': 'Galerija', 'nav.contact': 'Kontakt',
      'cta.book': 'Zakaži termin', 'cta.bookYour': 'Zakaži čip tjuning', 'cta.dyno': 'Pogledaj dyno rezultate',
      'a.menu': 'Otvori meni', 'a.home': 'Redliners Performance — početna',

      'hero.badge': 'Laboratorija za kalibraciju, proverena na dyno-u',
      'hero.l1': 'Oslobodi',
      'hero.l2': 'punu <span class="text-neon">snagu</span>',
      'hero.sub': 'Profesionalno <strong class="text-white">ECU, TCU i DCU reprogramiranje</strong> — kalibracije pisane po meri na dyno-u, a ne preuzete iz generičkog fajla. Putnička vozila, kamioni i poljoprivredna mehanizacija.',
      'hero.gain': 'Prosečan dobitak', 'hero.proto': 'Protokoli', 'hero.orig': 'Originalni fajl', 'hero.backed': 'Sačuvan',
      'hero.scroll': 'Skroluj dalje',

      'mq.1': 'ECU remap', 'mq.2': 'TCU kalibracija', 'mq.3': 'DCU / AdBlue', 'mq.4': 'Dyno tjuning', 'mq.5': 'Analiza logova', 'mq.6': 'Kamioni i poljoprivreda',

      'an.aria': 'Kako remap putuje kroz elektroniku vozila',
      'an.signal': 'Signal', 'an.start': 'Start', 'an.done': 'Kraj',
      'ch0.tag': '00 — Putanja signala',
      'ch0.h': 'Unutar <span class="text-neon">mašine</span>',
      'ch0.p': 'Savremeno vozilo je mreža upravljačkih jedinica koje komuniciraju kroz kilometre kablova. Skroluj i prati signal od dijagnostičkog porta do svakog modula koji kalibrišemo.',
      'ch0.c2': 'Do 100+ ECU jedinica',
      'ch1.tag': '01 — Povezivanje',
      'ch1.p': 'Originalni softver čitamo preko dijagnostičkog porta, na stolu (bench) ili u boot režimu. Vaš originalni fajl se arhivira pre nego što se promeni i jedan bajt.',
      'ch1.c2': 'Prvo pun bekap',
      'ch2.h': 'Upravljanje <span class="text-neon">motorom</span>',
      'ch2.p': 'Pritisak turba, doziranje goriva, trenutak ubrizgavanja, pritisak u rail-u i limiteri obrtnog momenta kalibrišu se zajedno i proveravaju logovima, a ne nagađanjem.',
      'ch3.h': 'Upravljanje <span class="text-volt">menjačem</span>',
      'ch3.p': 'Tačke promene brzina, pritisci kvačila i limiti obrtnog momenta usklađuju se sa novom snagom motora, kako bi menjač mogao da je podnese — glatko.',
      'ch4.h': 'Doziranje i <span class="text-neon">emisija</span>',
      'ch4.p': 'AdBlue/SCR doziranje, DPF i EGR sistemi — dijagnostikovani i rešeni na pravi način za automobile, kamione i poljoprivrednu mehanizaciju.',
      'chip.trucks': 'Kamioni i poljoprivreda',
      'ch5.tag': '05 — Pod kontrolom',
      'ch5.h': 'Podešeno do <span class="text-neon">srži</span>',
      'ch5.p': 'Jedna kalibracija za sve module koji su bitni: motor, menjač i emisioni sistem rade kao jedinstvena celina.',
      'ch5.c1': 'Svaki modul', 'ch5.c2': 'Jedna strategija',

      'eng.tag': '// 01 — Kalibracija',
      'eng.h': 'Projektovano.<br><span class="stroke-text">Podešeno</span> do srži.',
      'eng.p': 'Svaka mapa se pravi na osnovu stvarnog ponašanja vašeg motora na dyno-u — pritisak turba, gorivo, tajming, limiteri momenta i logika menjanja brzina podešavaju se zajedno, u bezbednim granicama komponenti.',
      'dyno.sheet': 'Dyno izveštaj · Merenje', 'dyno.aria': 'Dyno grafikon: serijska i tjuning snaga i obrtni moment', 'dyno.presets': 'Izbor motora',
      'dyno.l1': 'Snaga – tjuning', 'dyno.l2': 'Obrtni moment – tjuning', 'dyno.l3': 'Snaga – serija', 'dyno.l4': 'Obrtni moment – serija',
      'm.stock': 'Serija', 'm.power': 'Snaga · KS', 'm.torque': 'Obrtni moment · Nm',
      'log.title': 'Log uživo', 'log.boost': 'Pritisak turba', 'log.ign': 'Paljenje / SOI', 'log.egt': 'EGT pre turba', 'log.lambda': 'Lambda', 'log.status': 'Status', 'log.ok': 'U GRANICAMA',
      'dyno.note': 'Prikazane vrednosti su tipični primeri. Tačan dobitak za vaše vozilo potvrđujemo na dyno-u.',

      'svc.tag': '// 02 — Usluge',
      'svc.h': 'Šta <span class="text-neon">radimo</span>',
      'svc.p': 'Od čistog Stage 1 do kompletnog projekta sa hibridnim turbom — putnička vozila, teretni kamioni i poljoprivredna mehanizacija.',
      's1.h': 'ECU / TCU / DCU<br>Reprogramiranje',
      's1.p': 'Kalibracija upravljačkih jedinica motora, menjača i doziranja — pisana za vaše vozilo, kvalitet goriva i ciljeve. Pristup preko OBD-a, na stolu ili u boot režimu, uz arhiviranje originalnog fajla.',
      's1.st1': 'Samo softver, serijski hardver', 's1.st2': 'Usis, downpipe, interkuler', 's1.st3': 'Turbo, gorivo, kvačilo/TCU',
      's1.unlock': 'ECU otključavanje · 2020+ MY',
      's2.h': 'Dijagnostika i analiza logova',
      's2.p': 'Pronalaženje kvarova, snimanje podataka uživo i analiza logova — pritisak turba, korekcije goriva, EGT i detonacije — pre i posle svake mape.',
      's3.h': 'DPF / EGR / AdBlue rešenja',
      's3.p': 'Dijagnostika i softverska rešenja za kvarove emisionih sistema, u skladu sa propisima koji važe za vaše vozilo i njegovu namenu.',
      's4.h': 'Performans rešenja po meri',
      's4.p': 'Pops &amp; bangs, launch control, izmena limitera brzine i Vmax, hibridni turbo i projekti za stazu.',
      's5.h': 'Kodiranje i Component Protection',
      's5.p': 'Uklanjanje VAG Component Protection zaštite, kodiranje modula i adaptacije za mnoge marke vozila.',

      'stg.tag': '// 04 — Stage paketi',
      'stg.h': 'Izaberi svoj <span class="stroke-text">stage</span>',
      'stg.aria': 'Nivoi tjuninga', 'stg.typical': 'Tipičan dobitak', 'stg.redline': 'Crveno polje', 'stg.book': 'Zakaži ovaj stage',
      stages: [
        { tag: 'Samo softver', title: 'Stage 1 — Za svaki dan',
          desc: 'Optimizovan pritisak turba, gorivo i tajming na potpuno serijskom hardveru. Oštriji odziv, puniji obrtni moment i često manja potrošnja na autoputu.',
          list: ['Mapa po meri iz vašeg originalnog fajla', 'Dyno merenje pre i posle', 'Arhiviran originalni fajl', 'Provera stanja i log'] },
        { tag: 'Dodaci + softver', title: 'Stage 2 — Punim plućima',
          desc: 'Kalibracija prilagođena dodatnom hardveru, kako bi motor propuštao više vazduha i stabilno odvodio toplotu, merenje za merenjem.',
          list: ['Pojačan usis i downpipe', 'Veći interkuler', 'Povećani limiti momenta za kvačilo / TCU', 'Validacija kroz više dyno merenja'] },
        { tag: 'Hardverski projekat', title: 'Stage 3 — Do kraja',
          desc: 'Hibridni ili veći turbo, nadogradnja sistema goriva i pogona — projekat po meri, kalibrisan od nule za maksimalnu pouzdanu snagu.',
          list: ['Hibridni / veći turbo', 'Brizgaljke i pumpa goriva', 'Kalibracija menjača i kvačilo', 'Strategije za stazu i start'] }
      ],

      'st.vehicles': 'Modifikovanih vozila', 'st.hp': 'Dobijenih konjskih snaga', 'st.yrs': 'god.', 'st.exp': 'Iskustva', 'st.maps': 'Napisanih mapa po meri',

      'gal.tag': '// 06 — Galerija',
      'gal.h': 'Iz <span class="text-neon">radionice</span>',
      'gal.p': 'Pravi poslovi, pravi hardver — čitanje na stolu, flešovanje u vozilu, kalibracija menjača i rad na kamionima na terenu.',
      'gal.aria': 'Filter galerije',
      'f.all': 'Sve', 'f.car': 'Automobili', 'f.truck': 'Kamioni', 'f.ecu': 'ECU / Sto', 'f.tcu': 'Menjači', 'f.diag': 'Dijagnostika',
      'g1': 'Čitanje na stolu · Infineon TriCore ECU',
      'g2': 'Volvo kamion · rad na ECU na terenu',
      'g3': 'ZF 6HP28 · čitanje menjača Alpina B5',
      'g4': 'Remap DSG menjača · Škoda Octavia',
      'g5': 'BMW Bosch DDE ECU',
      'g6': 'Opel Astra · bekap Bosch ECU',
      'g7': 'Mercedes · dijagnostika i traženje kvarova',
      'g8': 'Bosch EDC17C74 · pun bekap VW Tiguan',
      'g9': 'Volvo kamion · ECU otvoren na terenu',
      'g10': 'Audi Q8 · kodiranje i ažuriranje softvera',
      'g11': 'Upravljačka jedinica menjača · rad na ploči',
      'g12': 'Audi A4 · flešovanje preko OBD',
      'g13': 'Merenje na otvorenom ECU',
      'g14': '6HP28 · čitanje ispod vozila',
      'g15': 'VW TDI · čitanje ECU u vozilu',
      'g16': 'Klasični ECU · EPROM era',

      'ft.tag': '// Spremni kad i vi',
      'ft.h': 'Vaš motor,<br><span class="text-neon">pod kontrolom.</span>',
      'ft.p': 'Recite nam šta vozite i šta želite od njega. Javićemo vam se sa planom, očekivanim dobitkom i terminom za dyno.',
      'ft.call': 'Viber / WhatsApp', 'ft.email': 'Email', 'ft.phone': 'Telefon / WhatsApp / Viber', 'ft.workshop': 'Radionica', 'ft.city': 'Niš, Srbija',
      'ft.line': 'ECU · TCU · DCU · Dyno · Dijagnostika', 'ft.top': 'Nazad na vrh ↑',

      'lb.aria': 'Pregled fotografija', 'lb.close': 'Zatvori', 'lb.prev': 'Prethodna fotografija', 'lb.next': 'Sledeća fotografija',

      'bk.tag': 'Zahtev za termin', 'bk.title': 'Zakažite termin', 'bk.close': 'Zatvori',
      'bk.name': 'Ime i prezime', 'bk.phone': 'Telefon', 'bk.email': 'Email',
      'bk.vehicle': 'Vozilo (marka, model, motor, godište)', 'bk.vehicle.ph': 'npr. Audi A4 2.0 TDI 2019',
      'bk.service': 'Usluga', 'bk.notes': 'Napomena', 'bk.notes.ph': 'Modifikacije, ciljevi, željeni datum…',
      'opt.stage1': 'Stage 1 remap', 'opt.stage2': 'Stage 2 remap', 'opt.stage3': 'Stage 3 remap',
      'opt.tcu': 'Remap TCU / menjača', 'opt.diag': 'Dijagnostika i analiza logova', 'opt.emis': 'DPF / EGR / AdBlue',
      'opt.coding': 'Kodiranje / Component Protection', 'opt.truck': 'Kamion / poljoprivredna mehanizacija', 'opt.custom': 'Projekat po meri',
      'bk.error': 'Molimo unesite ime, telefon i vozilo.', 'bk.send': 'Pošalji zahtev',
      'bk.done.h': 'Zahtev je primljen', 'bk.done.p': 'Javićemo vam se uskoro sa planom i terminom za dyno.',
      'fx.hold': 'Drži i daj gas', 'fx.limiter': 'Limiter',
      'nav.faq': 'Pitanja', 'faq.tag': '// 07 — Česta pitanja', 'faq.h': 'Jasni <span class="text-neon">odgovori</span>',
      'faq.p': 'Pitanja koja najčešće čujemo u radionici — sa iskrenim odgovorima.', 'faq.search': 'Pretražite pitanja…',
      'faq.empty': 'Nema rezultata — pitajte nas direktno.', 'faq.more': 'Imate još neko pitanje?', 'faq.ask': 'Pitajte na Viber / WhatsApp',
      'f.agri': 'Poljoprivreda', 'f.build': 'Građevinske mašine',
      'g17': 'Kamion · rad na ECU na terenu',
      'g18': 'John Deere 1270G harvester',
      'g19': 'Valjak Hamm H11i · kalibracija',
      'g20': 'Hidromek 102B · rad na terenu',
      'g21': 'CAT bager · dijagnostika uživo',
      'g22': 'Deutz-Fahr traktor · remap',
      'g23': 'Hidromek rovokopač-utovarivač',
      'g24': 'Iveco S-Way · Bosch MD1',
      'g25': 'Iveco Daily · EDC17C49',
      'g26': 'Renault Master 2.3 dCi · remap',
      'g27': 'Fiat Ducato 2.2 · Delphi DCM7.1',
      'g28': 'Audi A4 2.0 TFSI · remap',
      'g29': 'SsangYong XLV 1.6 · Delphi',
      'th.hi': 'Hvala, {name}!',
      'th.plain': 'Hvala!',
      'th.body': 'Vaš zahtev za {service} — {vehicle} — je primljen. Javićemo vam se uskoro na {phone} sa planom i terminom za dyno.',
      'th.auto': 'Povratak na sajt za {s} s',
      'bk.sending': 'Šalje se…',
      'mail.auto': 'Hvala na zahtevu ({ref}). Primili smo ga i javićemo vam se uskoro. — Redliners Performance, +381 63 481 566',
      'th.ref': 'Broj zahteva',
      'th.back': 'Nazad na sajt',
      'th.urgent': 'Hitno? Pišite nam direktno:',
      'bk.fail': 'Zahtev nije poslat. Pokušajte ponovo ili nam pišite na Viber / WhatsApp.',
      'fs.h': 'Terenski rad — <span class="text-neon">dolazimo kod vas</span>',
      'fs.p': 'Kamioni, traktori, kombajni i vozni parkovi ne mogu sebi da priušte odlazak u radionicu. Celu radionicu donosimo u vaše dvorište, na farmu ili gradilište — programatore, stabilizovano napajanje i dijagnostičku opremu — i podešavamo, dijagnostikujemo ili popravljamo na licu mesta.',
      'fs.b1.t': 'Bez transporta, minimalan zastoj',
      'fs.b1.p': 'Mašina radi do našeg dolaska i obično se istog dana vraća na posao.',
      'fs.b2.t': 'Isti standard kao u radionici',
      'fs.b2.p': 'Pun bekap, mapa po meri i provera logovima — bez prečica.',
      'fs.b3.t': 'Za tešku mehanizaciju',
      'fs.b3.p': 'Kamioni, traktori, kombajni i vozni parkovi — tamo gde se svaki radni sat računa.',
      'fs.b4.t': 'Ceo vozni park u jednoj poseti',
      'fs.b4.p': 'Više vozila odjednom, u terminu prilagođenom vašem radnom vremenu.',
      'fs.cta': 'Zakaži terenski dolazak',
      'fs.c1': 'Srbija i Bugarska',
      'fs.c2': 'Farme · vozni parkovi · dvorišta',
      'fs.c3': 'OBD · bench · boot na terenu',
      'fs.badge': 'Na terenu',
      'fs.cap': 'Volvo kamion · čitanje ECU na terenu',
      'fs.photo': 'Laptop i programator povezani na motor Volvo kamiona na terenu',
      'opt.field': 'Terenski rad (dolazimo kod vas)',
      'mq.7': 'Terenski rad',
      'pr.tag': '// 03 — Proces', 'pr.h': 'Od čitanja do <span class="text-neon">crvenog polja</span>',
      'pr.p': 'Šta se tačno dešava sa softverom vašeg vozila — korak po korak, bez skrivanja.', 'pr.tuned': 'Tjuning', 'pr.map': 'Mapa pritiska turba koja se menja iz fabričke u tjuning',
      'pr.s1.t': 'Konsultacija i provera stanja', 'pr.s1.p': 'Razgovaramo o vašim ciljevima i radimo kompletnu dijagnostiku: greške, podaci uživo, pritisak turba i korekcije goriva. Tjuning radimo samo na ispravnom motoru.',
      'pr.s2.t': 'Čitanje i bekap', 'pr.s2.p': 'ECU čitamo preko OBD-a, na stolu ili u boot režimu. Kompletan originalni softver arhivira se pre bilo kakve izmene.',
      'pr.s3.t': 'Analiza mapa', 'pr.s3.p': 'U WinOLS-u pronalazimo mape koje su bitne: ciljni pritisak turba, količinu i trenutak ubrizgavanja, pritisak u rail-u, limitere dima i obrtnog momenta.',
      'pr.s4.t': 'Kalibracija', 'pr.s4.p': 'Mape prepisujemo za vaše vozilo i vaše ciljeve, u granicama turba, brizgaljki, kvačila i menjača. Kontrolne sume se automatski koriguju.',
      'pr.s5.t': 'Upis i provera', 'pr.s5.p': 'Novi fajl se upisuje uz stabilizovano napajanje i proverava. Adaptacije se resetuju kako bi motor čisto naučio novu kalibraciju.',
      'pr.s6.t': 'Dyno i provera na putu', 'pr.s6.p': 'Dyno merenja pre i posle i logovi — pritisak turba, EGT, lambda, detonacije — potvrđuju rezultat. Po potrebi fino podešavamo i ponovo testiramo.',
      'pr.s7.t': 'Predaja i podrška', 'pr.s7.p': 'Dobijate dyno izveštaj, vaš originalni fajl ostaje arhiviran, a mi smo tu za pitanja, ažuriranja ili vraćanje na fabričko stanje.',
      'faq.filter': 'Filter pitanja',
      'faq.cat.all': 'Sve',
      'faq.cat.results': 'Rezultati',
      'faq.cat.safety': 'Sigurnost',
      'faq.cat.process': 'Proces i cena',
      'faq.q1': 'Zašto Redliners, a ne jeftin generički remap?',
      'faq.a1': 'Generički fajl je napisan za tip motora, a ne za vaše vozilo. Mi čitamo vaš originalni softver, sami pišemo kalibraciju i rezultat dokazujemo na dyno-u — pre i posle. Dobijate licencirane alate naših zvaničnih partnera, arhiviran originalni fajl i 10 godina iskustva iza svake mape: do sada više od 1.000 vozila i preko 4.000 mapa po meri.',
      'faq.q2': 'Šta je čip tjuning (reprogramiranje ECU)?',
      'faq.a2': 'Upravljačka jedinica motora (ECU) radi sa softverom koji sadrži mape za pritisak turba, gorivo, trenutak ubrizgavanja i limite obrtnog momenta. Proizvođači ih podešavaju konzervativno kako bi odgovarale svakom tržištu, kvalitetu goriva i klimi. Reprogramiranje znači pažljivo prepisivanje tih mapa za vaše konkretno vozilo — bez dodatnih kutijica i bez ugradnje delova. Rezultat: jača vuča, oštriji odziv na gas i često manja potrošnja — iz istog motora.',
      'faq.q3': 'Koliko ću dobiti snage?',
      'faq.a3': 'Zavisi od motora. Okvirno, Stage 1 na turbo dizelu donosi oko 15–35% više snage i obrtnog momenta, na turbo benzincu 15–30%, a atmosferski motori dobijaju samo 5–10%. Očekivane vrednosti vam kažemo pre početka, a rezultat potvrđujemo na dyno-u — vidite izmerene brojke, a ne obećanja.',
      'faq.q4': 'Da li će se promeniti potrošnja?',
      'faq.a4': 'Turbo dizeli često troše 5–10% manje u ravnomernoj vožnji, jer motor isti obrtni moment daje uz manje gasa. Ako često koristite dodatnu snagu, potrošnja raste — odlučuje desna noga. Za flote, kamione i traktore možemo napraviti i mapu usmerenu na uštedu goriva.',
      'faq.q5': 'Da li treba podesiti i menjač?',
      'faq.a5': 'Automatski menjači i menjači sa duplim kvačilom (DSG/DQ, ZF, Aisin) imaju sopstvene limite obrtnog momenta i logiku promene brzina. Za Stage 1 fabrički softver menjača je često dovoljan; od Stage 2 obično preporučujemo kalibraciju TCU-a kako bi promene ostale glatke, a kvačila ne bi bila preopterećena.',
      'faq.q6': 'Da li radite kamione i poljoprivrednu mehanizaciju?',
      'faq.a6': 'Da — i tu se tjuning najviše isplati. Kod kamiona i traktora cilj je jača vuča pod opterećenjem i manja potrošnja, a ušteda brzo raste uz sate i kilometre koje ove mašine rade. Pošaljite nam model i motor i potvrdićemo šta je moguće.',
      'faq.q7': 'Da li je bezbedno za motor?',
      'faq.a7': 'Pravilno napisana mapa ostaje u granicama motora, turba, menjača i kvačila. Prvo proveravamo stanje vozila, snimamo pritisak turba, temperature i gorivo i zadržavamo sigurnosne margine. Većina problema u ovom poslu dolazi od generičkih, preuzetih fajlova — svaki fajl koji upisujemo proveren je i prilagođen vašem vozilu.',
      'faq.q8': 'Može li se vozilo vratiti na fabričko stanje?',
      'faq.a8': 'Da. Pre bilo kakve izmene pravimo pun bekap originalnog softvera. Možemo ga vratiti kad god poželite — na primer pre prodaje vozila. Vaš original se nikada ne gubi.',
      'faq.q9': 'Da li proveravate vozilo pre tjuninga?',
      'faq.a9': 'Uvek. Svaki posao počinje kompletnom dijagnostikom i proverom stanja. Ako pronađemo problem, kažemo vam pre početka tjuninga — da nikada ne plaćate tjuning motora koji nije ispravan. Najbolje je da vozilo dovezete bez upaljenih lampica upozorenja, sa skorim servisom i dovoljno kvalitetnog goriva.',
      'faq.q10': 'Koliko traje?',
      'faq.a10': 'Stage 1 preko dijagnostičkog porta obično traje 1–3 sata, uključujući dijagnostiku i probnu vožnju. Rad na stolu ili u boot režimu, kalibracija menjača i dyno merenja traju duže — računajte na pola dana. Termini za kamione i poljoprivrednu mehanizaciju dogovaraju se pojedinačno.',
      'faq.q11': 'Koliko košta?',
      'faq.a11': 'Ponudu za vaše vozilo dobijate pre početka bilo kakvog rada. Cena zavisi od vozila, upravljačke jedinice i stage-a. Pošaljite nam marku, model, motor i godište preko Vibera ili WhatsApp-a i odgovorićemo sa tačnom cenom.',
      'faq.q12': 'Šta ako ovlašćeni servis ažurira softver?',
      'faq.a12': 'Pokriveni ste: vaša kalibracija ostaje u našoj arhivi. Ažuriranje u servisu može obrisati remap, zato zamolite servis da ne ažurira upravljačku jedinicu motora ili menjača — a ako se to ipak desi, javite nam se i ponovo ćemo upisati vašu mapu.',
      'pt.tag': '// 05 — Zvanični partneri',
      'pt.h': 'Profi alati.<br><span class="text-neon">Profi rezultati.</span>',
      'pt.p': 'Radimo sa licenciranim alatima i softverom naših zvaničnih partnera — standardom koji koriste vodeće tjuning kuće u Evropi.',
      'pt.badge': 'Zvanični partner', 'pt.cap': 'Magic Motorsport FLEX · OBD, bench i boot',
      'pt.aria': 'Zvanični partneri', 'pt.photo': 'Magic Motorsport FLEX programator povezan za čitanje ECU u radionici',
      'cc.title': 'Kontaktirajte nas', 'cc.sub': 'Izaberite aplikaciju preko koje želite da nam pišete.',
      'cc.viber': 'Otvara chat u Viberu', 'cc.whatsapp': 'Otvara chat u WhatsApp-u',
      'cc.waText': 'Pozdrav, zanima me čip tjuning za moje vozilo.'
    },

    /* ---------------- Български ---------------- */
    bg: {
      'meta.description': 'Redliners Performance — професионално препрограмиране на ECU, TCU и DCU, Stage 1–3 тунинг, доказан на дино стенд, диагностика и DPF/EGR/AdBlue решения за автомобили, камиони и селскостопанска техника.',
      'mail.subject': 'Заявка за час — ',

      'nav.services': 'Услуги', 'nav.dyno': 'Дино', 'nav.stages': 'Stage пакети', 'nav.gallery': 'Галерия', 'nav.contact': 'Контакти',
      'cta.book': 'Запази час', 'cta.bookYour': 'Запази час за чип тунинг', 'cta.dyno': 'Виж дино резултати',
      'a.menu': 'Отвори менюто', 'a.home': 'Redliners Performance — начало',

      'hero.badge': 'Лаборатория за калибриране, доказана на дино стенд',
      'hero.l1': 'Отключи',
      'hero.l2': 'пълната <span class="text-neon">мощ</span>',
      'hero.sub': 'Професионално <strong class="text-white">препрограмиране на ECU, TCU и DCU</strong> — калибрации по поръчка, написани на дино стенд, а не взети от готов файл. Леки автомобили, камиони и селскостопанска техника.',
      'hero.gain': 'Среден прираст', 'hero.proto': 'Протоколи', 'hero.orig': 'Оригинален файл', 'hero.backed': 'Запазен',
      'hero.scroll': 'Скролирай надолу',

      'mq.1': 'ECU ремап', 'mq.2': 'TCU калибриране', 'mq.3': 'DCU / AdBlue', 'mq.4': 'Дино тунинг', 'mq.5': 'Анализ на логове', 'mq.6': 'Камиони и агро',

      'an.aria': 'Как ремапът преминава през електрониката на автомобила',
      'an.signal': 'Сигнал', 'an.start': 'Старт', 'an.done': 'Край',
      'ch0.tag': '00 — Път на сигнала',
      'ch0.h': 'Вътре в <span class="text-neon">машината</span>',
      'ch0.p': 'Съвременният автомобил е мрежа от управляващи блокове, които комуникират през километри кабели. Скролирай и проследи сигнала от диагностичния порт до всеки модул, който калибрираме.',
      'ch0.c2': 'До 100+ ECU блока',
      'ch1.tag': '01 — Свързване',
      'ch1.p': 'Четем оригиналния софтуер през диагностичния порт, на стенд (bench) или в boot режим. Оригиналният ви файл се архивира, преди да се промени дори един байт.',
      'ch1.c1': 'OBD-II порт',
      'ch1.c2': 'Първо пълен бекъп',
      'ch2.h': 'Управление на <span class="text-neon">двигателя</span>',
      'ch2.p': 'Налягането на турбото, горивоподаването, моментът на впръскване, налягането в рейла и ограниченията на въртящия момент се калибрират заедно и се проверяват с логове, а не на око.',
      'ch3.h': 'Управление на <span class="text-volt">кутията</span>',
      'ch3.p': 'Точките на превключване, налягането на съединителите и ограниченията на въртящия момент се съобразяват с новата мощност на двигателя, за да може кутията да я понесе — плавно.',
      'ch4.h': 'Дозиране и <span class="text-neon">емисии</span>',
      'ch4.p': 'AdBlue/SCR дозиране, DPF и EGR системи — диагностицирани и решени правилно за автомобили, камиони и селскостопанска техника.',
      'chip.trucks': 'Камиони и агро',
      'ch5.tag': '05 — Под контрол',
      'ch5.h': 'Настроен до <span class="text-neon">ядрото</span>',
      'ch5.p': 'Една калибрация за всички важни модули: двигател, скоростна кутия и емисионна система работят като едно цяло.',
      'ch5.c1': 'Всеки модул', 'ch5.c2': 'Една стратегия',

      'eng.tag': '// 01 — Калибриране',
      'eng.h': 'Проектирано.<br><span class="stroke-text">Настроено</span> до ядрото.',
      'eng.p': 'Всяка карта се изгражда според реалното поведение на двигателя ви на дино стенда — турбо налягане, гориво, ъгли, ограничения на момента и логика на превключване се настройват заедно, в безопасните граници на компонентите.',
      'dyno.sheet': 'Дино протокол · Замер', 'dyno.aria': 'Дино графика: серийна и тунинг мощност и въртящ момент', 'dyno.presets': 'Избор на двигател',
      'dyno.l1': 'Мощност – тунинг', 'dyno.l2': 'Момент – тунинг', 'dyno.l3': 'Мощност – серийно', 'dyno.l4': 'Момент – серийно',
      'm.stock': 'Серийно', 'm.power': 'Мощност · к.с.', 'm.torque': 'Въртящ момент · Nm',
      'log.title': 'Лог на живо', 'log.boost': 'Турбо налягане', 'log.ign': 'Запалване / SOI', 'log.egt': 'EGT преди турбото', 'log.lambda': 'Ламбда', 'log.status': 'Статус', 'log.ok': 'В НОРМА',
      'dyno.note': 'Показаните стойности са типични примери. Точният прираст за вашия автомобил се потвърждава на дино стенда.',

      'svc.tag': '// 02 — Услуги',
      'svc.h': 'Какво <span class="text-neon">правим</span>',
      'svc.p': 'От чист Stage 1 до цялостен проект с хибридно турбо — леки автомобили, товарни камиони и селскостопанска техника.',
      's1.h': 'ECU / TCU / DCU<br>Ремап',
      's1.p': 'Калибриране на блоковете за управление на двигателя, скоростната кутия и дозирането — според вашия автомобил, качеството на горивото и целите ви. Достъп през OBD, на стенд или в boot режим, с архивиране на оригиналния файл.',
      's1.st1': 'Само софтуер, сериен хардуер', 's1.st2': 'Всмукване, даунпайп, интеркулер', 's1.st3': 'Турбо, горивна система, съединител/TCU',
      's1.unlock': 'Отключване на ECU · 2020+ MY',
      's2.h': 'Диагностика и анализ на логове',
      's2.p': 'Откриване на неизправности, запис на данни в реално време и анализ на логове — турбо налягане, корекции на горивото, EGT и детонации — преди и след всяка карта.',
      's3.h': 'DPF / EGR / AdBlue решения',
      's3.p': 'Диагностика и софтуерни решения за неизправности в емисионните системи, съобразно разпоредбите, приложими за вашия автомобил и неговото използване.',
      's4.h': 'Решения за мощност по поръчка',
      's4.p': 'Pops &amp; bangs, launch control, промяна на ограничителя и Vmax, хибридни турбо проекти и писта.',
      's5.h': 'Кодиране и Component Protection',
      's5.p': 'Премахване на VAG Component Protection, кодиране на модули и адаптации за много марки.',

      'stg.tag': '// 04 — Stage пакети',
      'stg.h': 'Избери своя <span class="stroke-text">stage</span>',
      'stg.aria': 'Нива на тунинг', 'stg.typical': 'Типичен прираст', 'stg.redline': 'Червена зона', 'stg.book': 'Запази този stage',
      stages: [
        { tag: 'Само софтуер', title: 'Stage 1 — За всеки ден',
          desc: 'Оптимизирано турбо налягане, горивоподаване и ъгли при напълно сериен хардуер. По-остър отклик, по-плътен въртящ момент и често по-нисък разход по магистрала.',
          list: ['Карта по поръчка от оригиналния ви файл', 'Дино замер преди и след', 'Архивиран оригинален файл', 'Проверка на състоянието и лог'] },
        { tag: 'Допълнения + софтуер', title: 'Stage 2 — С пълни гърди',
          desc: 'Калибрация, изградена около допълнителния хардуер, за да може двигателят да поема повече въздух и стабилно да отвежда топлината, замер след замер.',
          list: ['Подобрено всмукване и даунпайп', 'По-голям интеркулер', 'Повишени ограничения на момента за съединител / TCU', 'Валидиране с няколко дино замера'] },
        { tag: 'Хардуерен проект', title: 'Stage 3 — До краен предел',
          desc: 'Хибридно или по-голямо турбо, надграждане на горивната система и трансмисията — проект по поръчка, калибриран от нулата за максимална надеждна мощност.',
          list: ['Хибридно / голямо турбо', 'Дюзи и горивна помпа', 'Калибриране на кутията и съединител', 'Стратегии за писта и старт'] }
      ],

      'st.vehicles': 'Модифицирани автомобила', 'st.hp': 'Добавени конски сили', 'st.yrs': 'г.', 'st.exp': 'Опит', 'st.maps': 'Написани карти по поръчка',

      'gal.tag': '// 06 — Галерия',
      'gal.h': 'От <span class="text-neon">сервиза</span>',
      'gal.p': 'Истински поръчки, истински хардуер — четене на стенд, флашване в автомобила, калибриране на кутии и работа по камиони на място.',
      'gal.aria': 'Филтър на галерията',
      'f.all': 'Всички', 'f.car': 'Автомобили', 'f.truck': 'Камиони', 'f.ecu': 'ECU / Стенд', 'f.tcu': 'Кутии', 'f.diag': 'Диагностика',
      'g1': 'Четене на стенд · Infineon TriCore ECU',
      'g2': 'Камион Volvo · работа по ECU на място',
      'g3': 'ZF 6HP28 · четене на кутия Alpina B5',
      'g4': 'Ремап на DSG кутия · Škoda Octavia',
      'g5': 'BMW Bosch DDE ECU',
      'g6': 'Opel Astra · бекъп на Bosch ECU',
      'g7': 'Mercedes · диагностика и откриване на неизправности',
      'g8': 'Bosch EDC17C74 · пълен бекъп VW Tiguan',
      'g9': 'Камион Volvo · ECU, отворен на място',
      'g10': 'Audi Q8 · кодиране и обновяване на софтуера',
      'g11': 'Блок за управление на кутията · работа по платката',
      'g12': 'Audi A4 · флашване през OBD',
      'g13': 'Измерване по отворен ECU',
      'g14': '6HP28 · четене под автомобила',
      'g15': 'VW TDI · четене на ECU в автомобила',
      'g16': 'Класически ECU · ерата на EPROM',

      'ft.tag': '// Готови сме, когато и вие сте',
      'ft.h': 'Вашият двигател,<br><span class="text-neon">овладян.</span>',
      'ft.p': 'Кажете ни какво карате и какво искате от него. Ще се свържем с вас с план, очакван прираст и час за дино стенда.',
      'ft.call': 'Viber / WhatsApp', 'ft.email': 'Имейл', 'ft.phone': 'Телефон / WhatsApp / Viber', 'ft.workshop': 'Сервиз', 'ft.city': 'Кюстендил, България', 'ft.map': 'https://maps.google.com/?q=Kyustendil,Bulgaria',
      'ft.line': 'ECU · TCU · DCU · Дино · Диагностика', 'ft.top': 'Към началото ↑',

      'lb.aria': 'Преглед на снимки', 'lb.close': 'Затвори', 'lb.prev': 'Предишна снимка', 'lb.next': 'Следваща снимка',

      'bk.tag': 'Заявка за час', 'bk.title': 'Запазете час', 'bk.close': 'Затвори',
      'bk.name': 'Име', 'bk.phone': 'Телефон', 'bk.email': 'Имейл',
      'bk.vehicle': 'Автомобил (марка, модел, двигател, година)', 'bk.vehicle.ph': 'напр. Audi A4 2.0 TDI 2019',
      'bk.service': 'Услуга', 'bk.notes': 'Бележки', 'bk.notes.ph': 'Модификации, цели, предпочитана дата…',
      'opt.stage1': 'Stage 1 ремап', 'opt.stage2': 'Stage 2 ремап', 'opt.stage3': 'Stage 3 ремап',
      'opt.tcu': 'Ремап на TCU / кутия', 'opt.diag': 'Диагностика и анализ на логове', 'opt.emis': 'DPF / EGR / AdBlue',
      'opt.coding': 'Кодиране / Component Protection', 'opt.truck': 'Камион / селскостопанска техника', 'opt.custom': 'Проект по поръчка',
      'bk.error': 'Моля, попълнете име, телефон и автомобил.', 'bk.send': 'Изпрати заявка',
      'bk.done.h': 'Заявката е получена', 'bk.done.p': 'Ще се свържем с вас скоро с план и час за дино стенда.',
      'fx.hold': 'Задръж за газ', 'fx.limiter': 'Лимитер',
      'nav.faq': 'Въпроси', 'faq.tag': '// 07 — Често задавани въпроси', 'faq.h': 'Ясни <span class="text-neon">отговори</span>',
      'faq.p': 'Въпросите, които чуваме най-често в сервиза — с честни отговори.', 'faq.search': 'Търсете въпрос…',
      'faq.empty': 'Няма резултати — попитайте ни директно.', 'faq.more': 'Имате още въпрос?', 'faq.ask': 'Попитайте във Viber / WhatsApp',
      'f.agri': 'Агро', 'f.build': 'Строителна техника',
      'g17': 'Камион · работа по ECU на място',
      'g18': 'Харвестър John Deere 1270G',
      'g19': 'Валяк Hamm H11i · калибриране',
      'g20': 'Hidromek 102B · работа на място',
      'g21': 'Багер CAT · диагностика в реално време',
      'g22': 'Трактор Deutz-Fahr · ремап',
      'g23': 'Багер-товарач Hidromek',
      'g24': 'Iveco S-Way · Bosch MD1',
      'g25': 'Iveco Daily · EDC17C49',
      'g26': 'Renault Master 2.3 dCi · ремап',
      'g27': 'Fiat Ducato 2.2 · Delphi DCM7.1',
      'g28': 'Audi A4 2.0 TFSI · ремап',
      'g29': 'SsangYong XLV 1.6 · Delphi',
      'th.hi': 'Благодарим, {name}!',
      'th.plain': 'Благодарим!',
      'th.body': 'Заявката ви за {service} — {vehicle} — е получена. Ще се свържем с вас скоро на {phone} с план и час за дино стенда.',
      'th.auto': 'Връщане към сайта след {s} с',
      'bk.sending': 'Изпращане…',
      'mail.auto': 'Благодарим за заявката ({ref}). Получихме я и ще се свържем с вас скоро. — Redliners Performance, +381 63 481 566',
      'th.ref': 'Номер на заявката',
      'th.back': 'Обратно към сайта',
      'th.urgent': 'Бързате? Пишете ни директно:',
      'bk.fail': 'Заявката не беше изпратена. Опитайте отново или ни пишете във Viber / WhatsApp.',
      'fs.h': 'Работа на място — <span class="text-neon">идваме при вас</span>',
      'fs.p': 'Камионите, тракторите, комбайните и автопарковете не могат да си позволят път до сервиза. Пренасяме целия сервиз във вашия двор, ферма или обект — програматори, стабилизирано захранване и диагностично оборудване — и настройваме, диагностицираме или ремонтираме на място.',
      'fs.b1.t': 'Без транспорт, минимален престой',
      'fs.b1.p': 'Машината работи до нашето пристигане и обикновено се връща към работа още същия ден.',
      'fs.b2.t': 'Същият стандарт като в сервиза',
      'fs.b2.p': 'Пълен бекъп, карта по поръчка и проверка с логове — без компромиси.',
      'fs.b3.t': 'За тежка техника',
      'fs.b3.p': 'Камиони, трактори, комбайни и автопаркове — там, където всеки работен час е важен.',
      'fs.b4.t': 'Целият автопарк с едно посещение',
      'fs.b4.p': 'Няколко машини наведнъж, в час, съобразен с работното ви време.',
      'fs.cta': 'Заявете посещение на място',
      'fs.c1': 'Сърбия и България',
      'fs.c2': 'Ферми · автопаркове · дворове',
      'fs.c3': 'OBD · bench · boot на място',
      'fs.badge': 'На място',
      'fs.cap': 'Камион Volvo · четене на ECU на място',
      'fs.photo': 'Лаптоп и програматор, свързани към двигателя на камион Volvo на място',
      'opt.field': 'Работа на място (идваме при вас)',
      'mq.7': 'Работа на място',
      'pr.tag': '// 03 — Процес', 'pr.h': 'От четене до <span class="text-neon">червената зона</span>',
      'pr.p': 'Какво точно се случва със софтуера на автомобила ви — стъпка по стъпка, без нищо скрито.', 'pr.tuned': 'Тунинг', 'pr.map': 'Карта на турбо налягането, която се променя от фабрична към тунинг',
      'pr.s1.t': 'Консултация и проверка', 'pr.s1.p': 'Обсъждаме целите ви и правим пълна диагностика: грешки, данни в реално време, турбо налягане и корекции на горивото. Тунинг правим само на изправен двигател.',
      'pr.s2.t': 'Четене и бекъп', 'pr.s2.p': 'ECU се чете през OBD, на стенд или в boot режим. Целият оригинален софтуер се архивира, преди да се промени каквото и да е.',
      'pr.s3.t': 'Анализ на картите', 'pr.s3.p': 'В WinOLS откриваме картите, които имат значение: целево турбо налягане, количество и момент на впръскване, налягане в рейла, ограничители на дима и въртящия момент.',
      'pr.s4.t': 'Калибриране', 'pr.s4.p': 'Пренаписваме картите за вашия автомобил и вашите цели, в границите на турбото, дюзите, съединителя и кутията. Контролните суми се коригират автоматично.',
      'pr.s5.t': 'Запис и проверка', 'pr.s5.p': 'Новият файл се записва при стабилизирано захранване и се проверява. Адаптациите се нулират, за да научи двигателят новата калибрация чисто.',
      'pr.s6.t': 'Дино и пътен тест', 'pr.s6.p': 'Дино замери преди и след и логове — турбо налягане, EGT, ламбда, детонации — потвърждават резултата. При нужда донастройваме и тестваме отново.',
      'pr.s7.t': 'Предаване и поддръжка', 'pr.s7.p': 'Получавате дино протокол, оригиналният ви файл остава в архива, а ние сме на разположение за въпроси, актуализации или връщане към фабричните настройки.',
      'faq.filter': 'Филтър на въпросите',
      'faq.cat.all': 'Всички',
      'faq.cat.results': 'Резултати',
      'faq.cat.safety': 'Сигурност',
      'faq.cat.process': 'Процес и цена',
      'faq.q1': 'Защо Redliners, а не евтин стандартен ремап?',
      'faq.a1': 'Стандартният файл е написан за тип двигател, а не за вашия автомобил. Ние четем оригиналния ви софтуер, сами пишем калибрацията и доказваме резултата на дино стенда — преди и след. Получавате лицензирани инструменти от официалните ни партньори, архивиран оригинален файл и 10 години опит зад всяка карта: досега над 1000 автомобила и над 4000 карти по поръчка.',
      'faq.q2': 'Какво е чип тунинг (препрограмиране на ECU)?',
      'faq.a2': 'Блокът за управление на двигателя (ECU) работи със софтуер, съдържащ карти за турбо налягането, горивото, момента на впръскване и ограниченията на въртящия момент. Производителите ги настройват консервативно, за да покрият всеки пазар, качество на горивото и климат. Препрограмирането означава внимателно пренаписване на тези карти за конкретния ви автомобил — без допълнителни кутии и без монтиране на части. Резултатът: по-силно теглене, по-остър отговор на газта и често по-нисък разход — от същия двигател.',
      'faq.q3': 'Колко мощност ще спечеля?',
      'faq.a3': 'Зависи от двигателя. Ориентировъчно Stage 1 при турбодизел добавя около 15–35% мощност и въртящ момент, при турбобензинов двигател 15–30%, а атмосферните двигатели печелят само 5–10%. Казваме ви очакваните стойности преди началото и потвърждаваме резултата на дино стенда — виждате измерени числа, а не обещания.',
      'faq.q4': 'Ще се промени ли разходът на гориво?',
      'faq.a4': 'Турбодизелите често харчат с 5–10% по-малко при равномерно шофиране, защото двигателят дава същия въртящ момент с по-малко газ. Ако често използвате допълнителната мощност, разходът се увеличава — решава десният крак. За автопаркове, камиони и трактори можем да напишем и карта, насочена към икономия на гориво.',
      'faq.q5': 'Трябва ли да се настрои и скоростната кутия?',
      'faq.a5': 'Автоматичните кутии и тези с двоен съединител (DSG/DQ, ZF, Aisin) имат собствени ограничения на момента и логика на превключване. За Stage 1 фабричният софтуер на кутията често е достатъчен; от Stage 2 обикновено препоръчваме калибриране на TCU, за да остане превключването плавно и съединителите да не се претоварват.',
      'faq.q6': 'Работите ли с камиони и селскостопанска техника?',
      'faq.a6': 'Да — и точно там тунингът се отплаща най-много. При камионите и тракторите целта е по-силно теглене под натоварване и по-нисък разход, а спестяванията бързо растат с часовете и километрите, които тези машини работят. Изпратете ни модела и двигателя и ще потвърдим какво е възможно.',
      'faq.q7': 'Безопасно ли е за двигателя?',
      'faq.a7': 'Правилно написаната карта остава в границите на двигателя, турбото, скоростната кутия и съединителя. Първо проверяваме състоянието на автомобила, записваме турбо налягане, температури и горивоподаване и запазваме резерв за сигурност. Повечето проблеми в бранша идват от готови, изтеглени файлове — всеки файл, който записваме, е проверен и настроен за вашия автомобил.',
      'faq.q8': 'Може ли автомобилът да се върне към фабричните настройки?',
      'faq.a8': 'Да. Преди каквато и да е промяна правим пълен бекъп на оригиналния софтуер. Можем да го възстановим по всяко време — например преди продажба на автомобила. Оригиналът ви никога не се губи.',
      'faq.q9': 'Проверявате ли автомобила преди тунинга?',
      'faq.a9': 'Винаги. Всяка поръчка започва с пълна диагностика и проверка на състоянието. Ако открием проблем, ще ви кажем преди да започне тунингът — за да не плащате никога за тунинг на двигател, който не е изправен. Най-добре докарайте автомобила без светнали предупредителни лампи, със скорошно обслужване и достатъчно качествено гориво.',
      'faq.q10': 'Колко време отнема?',
      'faq.a10': 'Stage 1 през диагностичния порт обикновено отнема 1–3 часа, включително диагностика и пробно шофиране. Работата на стенд или в boot режим, калибрирането на кутията и дино замерите отнемат повече време — планирайте половин ден. Часовете за камиони и селскостопанска техника се уговарят индивидуално.',
      'faq.q11': 'Колко струва?',
      'faq.a11': 'Получавате оферта за вашия автомобил, преди да започне каквато и да е работа. Цената зависи от автомобила, блока за управление и избрания stage. Изпратете ни марка, модел, двигател и година през Viber или WhatsApp и ще ви отговорим с точната цена.',
      'faq.q12': 'Какво става, ако сервизът обнови софтуера?',
      'faq.a12': 'Покрити сте: калибрацията ви остава в нашия архив. Актуализация в сервиза може да изтрие ремапа, затова помолете сервиза да не обновява блока за управление на двигателя или кутията — а ако все пак се случи, свържете се с нас и ще запишем картата ви отново.',
      'pt.tag': '// 05 — Официални партньори',
      'pt.h': 'Про инструменти.<br><span class="text-neon">Про резултати.</span>',
      'pt.p': 'Работим с лицензирани инструменти и софтуер от нашите официални партньори — същия стандарт, който използват водещите тунинг компании в Европа.',
      'pt.badge': 'Официален партньор', 'pt.cap': 'Magic Motorsport FLEX · OBD, bench и boot',
      'pt.aria': 'Официални партньори', 'pt.photo': 'Програматор Magic Motorsport FLEX, свързан за четене на ECU в сервиза',
      'cc.title': 'Свържете се с нас', 'cc.sub': 'Изберете приложението, през което да ни пишете.',
      'cc.viber': 'Отваря чат във Viber', 'cc.whatsapp': 'Отваря чат в WhatsApp',
      'cc.waText': 'Здравейте, интересувам се от чип тунинг за моя автомобил.'
    }
  };
  // Gallery: the alt text follows the caption in translated languages
  ['sr', 'bg'].forEach(l => { for (let i = 1; i <= 29; i++) DICT[l]['g' + i + '.alt'] = DICT[l]['g' + i]; });

  /* ---------- Capture English from the page ---------- */
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  textNodes.forEach(n => { n.__en = n.innerHTML; });
  const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')].map(n => {
    const pairs = n.getAttribute('data-i18n-attr').split(';').map(s => s.split(':').map(x => x.trim())).filter(p => p[0] && p[1]);
    const en = {}; pairs.forEach(([a]) => { en[a] = n.getAttribute(a); });
    return { n, pairs, en };
  });
  const metaDesc = document.querySelector('meta[name="description"]');
  const enDesc = metaDesc ? metaDesc.content : '';

  /* ---------- Core ---------- */
  let current = 'en';
  const listeners = [];

  function t(key) {
    const d = DICT[current];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return DICT.en[key];
  }

  function store(lang) { try { localStorage.setItem('rl-lang', lang); } catch (e) { /* storage unavailable */ } }
  function stored() { try { return localStorage.getItem('rl-lang'); } catch (e) { return null; } }

  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS[q]) return q;
    const s = stored(); if (s && LANGS[s]) return s;
    const nav = (navigator.languages || [navigator.language || 'en']).map(x => String(x).toLowerCase());
    for (const l of nav) {
      if (/^(sr|hr|bs|sh|cnr)\b/.test(l)) return 'sr';
      if (/^bg\b/.test(l)) return 'bg';
      if (/^en\b/.test(l)) return 'en';
    }
    return 'en';
  }

  function apply(lang, opts = {}) {
    if (!LANGS[lang]) lang = 'en';
    current = lang;
    const d = DICT[lang] || {};
    document.documentElement.lang = LANGS[lang].html;

    textNodes.forEach(n => {
      const k = n.getAttribute('data-i18n');
      const v = lang === 'en' ? n.__en : (d[k] !== undefined ? d[k] : n.__en);
      if (n.innerHTML !== v) n.innerHTML = v;
    });
    attrNodes.forEach(({ n, pairs, en }) => {
      pairs.forEach(([a, k]) => {
        const v = lang === 'en' ? en[a] : (d[k] !== undefined ? d[k] : en[a]);
        if (v !== null && v !== undefined) n.setAttribute(a, v);
      });
    });
    if (metaDesc) metaDesc.content = lang === 'en' ? enDesc : (d['meta.description'] || enDesc);

    document.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.getAttribute('data-lang') === lang;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (!opts.initial) {
      store(lang);
      try {
        const u = new URL(location.href);
        if (lang === 'en') u.searchParams.delete('lang'); else u.searchParams.set('lang', lang);
        history.replaceState(null, '', u);
      } catch (e) { /* file:// or sandboxed frame */ }
    }
    listeners.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    e.preventDefault();
    const lang = b.getAttribute('data-lang');
    if (lang === current) return;
    document.documentElement.classList.add('lang-switching');
    setTimeout(() => {
      apply(lang);
      requestAnimationFrame(() => document.documentElement.classList.remove('lang-switching'));
    }, 140);
  });

  window.RL_I18N = {
    get lang() { return current; },
    get locale() { return LANGS[current].locale; },
    t,
    set: apply,
    onChange(fn) { listeners.push(fn); }
  };

  apply(detect(), { initial: true });
})();
