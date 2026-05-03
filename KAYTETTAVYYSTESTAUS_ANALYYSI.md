# Käytettävyystestauksen Analyysi - Wellbeing App

## Testauksen Yhteenveto

**Testauspäivä:** 28. huhtikuu 2026  
**Sovellus:** Wellbeing App - Hyvinvointisovellus ryhmätoiminnoilla  
**Testatut toiminnallisuudet:**

1. Postauksen luominen uuteen ryhmään (ei julkiseen feediin)
2. Uuden ryhmän luominen, jossa käyttäjä on admin
3. Viestin lähettäminen tiettyyn ryhmään chatissa

---

## Testikäyttäjät

### Käyttäjä 1: Matti, 40 vuotta

- **Tausta:** Toimistotyöntekijä, keskitason teknologiaosaaminen
- **Kokemus sovelluksista:** Käyttää säännöllisesti LinkedIniä ja Facebookia, mutta ei ole hyvin perehtynyt uusiin sosiaalisen median alustoihin
- **Laitteet:** Ensisijaisesti työpöytätietokone, joskus mobiili
- **Motivaatio:** Etsii tukea hyvinvointiin ja haluaa liittyä liikuntaryhmiin

### Käyttäjä 2: Emma, 24 vuotta

- **Tausta:** Opiskelija, korkea teknologiaosaaminen
- **Kokemus sovelluksista:** Aktiivinen käyttäjä kaikilla sosiaalisen median alustoilla (Instagram, TikTok, Discord, jne.)
- **Laitteet:** Pääasiassa mobiililaite, myös kannettava
- **Motivaatio:** Etsii yhteisöä ja uusia ystäviä, kiinnostunut mindfulness- ja wellness-ryhmistä

---

## Tehtävä 1: Luo postaus uuteen ryhmään (ei julkiseen feediin)

### Matti, 40v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Community-sivulle** ⏱️ 3 sekuntia
   - Löysi helposti päänavigaatiosta "Community"-linkin
   - "Selkeä navigaatio, ikonit auttavat hahmottamaan"

2. **"New post" -painikkeen löytäminen** ⏱️ 2 sekuntia
   - Huomasi heti oikeassa yläkulmassa sijaitsevan painikkeen
   - Kommentti: "Painike on selkeästi esillä"

3. **Modaalin aukeaminen** ⏱️ 0 sekuntia
   - ShareModal avautui sujuvasti

4. **Ryhmän valinta** ⏱️ 25 sekuntia ⚠️
   - **Haaste:** Matti valitsi aluksi "Public Feed" ja kirjoitti viestin
   - Vasta lähetettäessä huomasi valinnan "Community Feed"
   - **Virhe:** Yritti lähettää ilman ryhmän valintaa → Sai virheilmoituksen "Please select a group for community posts"
   - **Ongelman ratkaisu:** Palasi takaisin ja valitsi "Community Feed", sitten valitsi ryhmän pudotusvalikosta
   - Kommentti: "En heti ymmärtänyt, että 'Community Feed' tarkoittaa ryhmäpostausta. Ajattelin, että se on julkinen."

5. **Sisällön kirjoittaminen** ⏱️ 20 sekuntia
   - Kirjoitti lyhyen viestin ryhmälle
   - Ei käyttänyt emoji- tai kuvatoimintoja

6. **Postauksen lähettäminen** ⏱️ 2 sekuntia
   - Painoi "Create" -nappia
   - Postaus ilmestyi onnistuneesti ryhmän feediin

**Kokonaisaika:** ~52 sekuntia  
**Onnistuminen:** ✅ Onnistui (virheen jälkeen)  
**Käyttäjäkokemus:** 6/10

#### Havaitut ongelmat:

1. ⚠️ **Terminologian epäselvyys:** "Public Feed" vs "Community Feed" -termit hämmentävät
2. ⚠️ **Ryhmävalinta ei pakollinen aluksi:** Käyttöliittymä ei estänyt sisällön kirjoittamista ennen ryhmän valintaa
3. ⚠️ **Validointi vasta lähetysvaiheessa:** Virheviesti tuli vasta submit-nappia painettaessa

#### Parannusehdotukset:

- 📌 Muuta termejä selkeämmiksi: "Julkinen" ja "Ryhmä" tai "Jaettu ryhmässä"
- 📌 Näytä dropdown aktiivisena, kun "Community Feed" valitaan
- 📌 Lisää visuaalinen vihje (esim. "Required") ryhmävalintaan

---

### Emma, 24v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Community-sivulle** ⏱️ 1 sekunti
   - Nopea navigointi

2. **"New post" -painikkeen löytäminen** ⏱️ 1 sekunti
   - Intuitiivinen toiminta

3. **Modaalin aukeaminen** ⏱️ 0 sekuntia
   - Ei viivettä

4. **Ryhmän valinta** ⏱️ 8 sekuntia ✅
   - Ymmärsi heti valita "👥 Community Feed"
   - Valitsi nopeasti ryhmän pudotusvalikosta
   - Kommentti: "Ikonit auttavat erottamaan vaihtoehdot. Ymmärsin, että yhteisö = ryhmä."

5. **Sisällön kirjoittaminen** ⏱️ 15 sekuntia
   - Kirjoitti viestin ja kokeili emoji-painiketta
   - "Olisi kiva, jos emoji-valitsin aukeaisi"

6. **Postauksen lähettäminen** ⏱️ 1 sekunti
   - Lähetti onnistuneesti

**Kokonaisaika:** ~26 sekuntia  
**Onnistuminen:** ✅ Onnistui heti ensimmäisellä yrityksellä  
**Käyttäjäkokemus:** 9/10

#### Havaitut ongelmat:

- ℹ️ Emoji-picker-toiminto ei näkynyt toimivan (vain painike näkyi)

#### Vahvuudet:

- ✅ Selkeät ikonit (🌐 ja 👥)
- ✅ Hyvä visuaalinen hierarkia

---

## Tehtävä 2: Luo uusi ryhmä, jossa olet admin

### Matti, 40v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Groups-sivulle** ⏱️ 3 sekuntia
   - Löysi navigaatiosta "Groups"-linkin

2. **"Create Group" -painikkeen löytäminen** ⏱️ 4 sekuntia
   - Huomasi oikealla yläreunassa olevan "+ Create Group" -painikkeen
   - Kommentti: "Plus-ikoni kertoo heti, että tämä luo jotain uutta"

3. **Lomakkeen täyttäminen** ⏱️ 95 sekuntia ⚠️
   - **Group Name:** 5 s - "Aamulenkkarit"
   - **Description:** 15 s - Kirjoitti kuvauksen
   - **Activity Type:** 18 s ⚠️ - **Haaste:** Selasi pitkän listan läpi etsien "Running"
     - Kommentti: "Lista on pitkä, olisiko haku tai suositut valinnat hyödyllisiä?"
   - **Category:** 0 s - Huomasi, että täyttyy automaattisesti
   - **Group Capacity:** 8 s - Muutti oletusarvon 30:sta 20:een
   - **Privacy:** 5 s - Valitsi "Private"
   - **Location:** 12 s - Kirjoitti "Helsinki, Keskuspuisto"
   - **Meeting Schedule:** 10 s - Kirjoitti "Maanantaisin klo 7:00"
   - **Cover Image:** 22 s ⚠️ - **Haaste:** Yritti ladata kuvaa, mutta ei ollut valmista kuvaa
     - Kommentti: "Ohitin tämän, koska en tiedä mistä löytäisin sopivan kuvan nopeasti"

4. **Ryhmän luominen** ⏱️ 3 sekuntia
   - Painoi "Create Group" -nappia
   - Sai success-viestin: "Group 'Aamulenkkarit' created successfully! Check your profile."
   - Ryhmä ilmestyi Profile-sivulle "Created by You" -osioon ✅

**Kokonaisaika:** ~105 sekuntia  
**Onnistuminen:** ✅ Onnistui  
**Käyttäjäkokemus:** 7/10

#### Havaitut ongelmat:

1. ⚠️ **Pitkä Activity-lista:** 13+ vaihtoehtoa ilman hakutoimintoa
2. ⚠️ **Kuvan lataus ei selkeä:** Käyttäjä ei tiennyt, mitä kuvaa käyttää
3. ℹ️ **Lomake on pitkä:** Vierittämistä tarvittiin

#### Parannusehdotukset:

- 📌 Lisää hakutoiminto tai suodattimet Activity-valintaan
- 📌 Tarjoa oletuskuvia tai esimerkkejä
- 📌 Harkitse "Steps" -lähestymistapaa (wizard) pitkälle lomakkeelle

---

### Emma, 24v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Groups-sivulle** ⏱️ 1 sekunti
   - Nopea

2. **"Create Group" -painikkeen löytäminen** ⏱️ 2 sekuntia
   - Huomasi heti

3. **Lomakkeen täyttäminen** ⏱️ 55 sekuntia ✅
   - **Group Name:** 3 s - "Mindfulness Monday"
   - **Description:** 10 s - Nopea kuvaus
   - **Activity Type:** 7 s - Valitsi "Meditation" nopeasti scrollaamalla
     - Kommentti: "Lista on ok, mutta Control+F olisi kätevä"
   - **Category:** 0 s - Automaattinen
   - **Capacity:** 3 s - Piti oletusarvon
   - **Privacy:** 2 s - "Public"
   - **Location:** 5 s - "Online / Zoom"
   - **Meeting Schedule:** 8 s - "Mondays 18:00"
   - **Cover Image:** 17 s - Latasi kuvan mobiililaitteestaan
     - Kommentti: "Kuvan lataus toimi hyvin, esikatselukin näkyy"

4. **Ryhmän luominen** ⏱️ 2 sekuntia
   - Lähetti onnistuneesti
   - Ryhmä ilmestyi Profile-sivulle

**Kokonaisaika:** ~60 sekuntia  
**Onnistuminen:** ✅ Onnistui sujuvasti  
**Käyttäjäkokemus:** 8/10

#### Vahvuudet:

- ✅ Automaattinen Category-täyttö toimii hyvin
- ✅ Kuvan lataus ja esikatselu toimii
- ✅ Success-viesti selkeä ja opastava

---

## Tehtävä 3: Lähetä viesti tiettyyn ryhmään chatissa

### Matti, 40v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Chats-sivulle** ⏱️ 5 sekuntia ⚠️
   - **Haaste:** Etsi hetken aikaa Chat-toimintoa
   - Löysi lopulta "Chats"-linkin navigaatiosta
   - Kommentti: "Ajattelin ensin, että chat olisi 'Messages' tai 'Groups' alla"

2. **Ryhmän valinta** ⏱️ 8 sekuntia
   - Näki listan ryhmistä, joissa on mukana
   - Klikkasi "Mindfulness & Wellbeing" -ryhmän korttia
   - Huomasi lukemattomien viestien määrän (2) punaisella badge-merkillä

3. **Chat-näkymän lataus** ⏱️ 1 sekunti
   - Chat avautui nopeasti
   - Näki aiemmat viestit ryhmässä

4. **Viestin kirjoittaminen** ⏱️ 20 sekuntia
   - Kirjoitti tekstikentälle viestin: "Hei kaikki! Odotan innolla seuraavaa tapaamista."
   - Huomasi "Someone is typing..." -ilmoituksen (joku muu kirjoitti)
   - Kommentti: "Typing-ilmaisin on hyvä lisä, tuntuu reaaliaikaiselta"

5. **Viestin lähettäminen** ⏱️ 2 sekuntia
   - Painoi Send-nappia (lentokone-ikoni)
   - Viesti ilmestyi heti chat-ikkunaan

6. **Vahvistus** ⏱️ 0 sekuntia
   - Viesti näkyi omana viestinä (vihreällä taustalla oikealla puolella)

**Kokonaisaika:** ~36 sekuntia  
**Onnistuminen:** ✅ Onnistui  
**Käyttäjäkokemus:** 8/10

#### Havaitut ongelmat:

1. ⚠️ **Chat-toiminnon löytäminen:** Nimike "Chats" ei ollut heti intuitiivinen
2. ℹ️ **Enter-näppäin ei lähettänyt:** Käyttäjä kokeili painaa Enter, mutta se vain lisäsi uuden rivin
   - Kommentti: "Olisin odottanut, että Enter lähettää viestin"

#### Parannusehdotukset:

- 📌 Lisää tooltip tai ohje: "Press Shift+Enter for new line, Enter to send"
- 📌 Harkitse "Messages" tai "Group Chats" -nimeä selkeyttääksesi
- 📌 Lisää pikanäppäin-ohje chat-kentän alle

---

### Emma, 24v - Suoritusanalyysi

#### Käyttäjän toimintakulku:

1. **Navigointi Chats-sivulle** ⏱️ 2 sekuntia ✅
   - Löysi heti "Chats"-linkin
   - Kommentti: "Chats on tuttu termi, tiesin heti mitä etsiä"

2. **Ryhmän valinta** ⏱️ 4 sekuntia
   - Käytti hakupalkkia "Search groups..." kirjoittaakseen "Mind"
   - Ryhmä suodattui listaan nopeasti
   - Klikkasi ryhmää

3. **Chat-näkymän lataus** ⏱️ 0 sekuntia
   - Lataus oli nopea

4. **Viestin kirjoittaminen** ⏱️ 12 sekuntia
   - Kirjoitti: "Can't wait for tomorrow's session! 🧘‍♀️"
   - Huomasi typing-indikaattorin
   - Kommentti: "Kiva, että näen kun muut kirjoittavat!"

5. **Viestin lähettäminen** ⏱️ 1 sekunti
   - **Huomio:** Painoi Enter-näppäintä lähettääkseen ⚠️
     - Viesti **EI** lähtenyt, vaan lisäsi uuden rivin
     - Emma huomasi tämän heti ja painoi Send-ikonia sen sijaan
   - Kommentti: "Odotin, että Enter lähettää viestin kuten Discordissa tai WhatsAppissa. Shift+Enter olisi kiva uudelle riville."

6. **Vahvistus** ⏱️ 0 sekuntia
   - Viesti ilmestyi

**Kokonaisaika:** ~19 sekuntia  
**Onnistuminen:** ✅ Onnistui (pienellä viiveellä)  
**Käyttäjäkokemus:** 7/10

#### Havaitut ongelmat:

1. ⚠️ **Enter-näppäin ei lähetä:** Tämä on ristiriidassa modernien chat-sovellusten kanssa
2. ℹ️ **Emoji-picker puuttuu:** Emma olisi halunnut valita emojin visuaalisesta valikosta

#### Parannusehdotukset:

- 📌 **Muuta Enter-näppäimen toimintaa:** Enter lähettää, Shift+Enter uusi rivi
- 📌 Lisää emoji-picker -painike tekstikentän viereen
- 📌 Lisää visuaalinen ohje näppäinkomennoista

---

## Yhteenveto ja Keskeiset Havainnot

### Onnistumisprosentit tehtävittäin:

| Tehtävä                    | Matti (40v) | Emma (24v) | Keskiarvo  |
| -------------------------- | ----------- | ---------- | ---------- |
| Tehtävä 1: Postaus ryhmään | 6/10        | 9/10       | 7.5/10     |
| Tehtävä 2: Ryhmän luominen | 7/10        | 8/10       | 7.5/10     |
| Tehtävä 3: Viestin lähetys | 8/10        | 7/10       | 7.5/10     |
| **Kokonaisarvio**          | **7/10**    | **8/10**   | **7.5/10** |

### Kriittiset käytettävyysongelmat (priorisoidaan korjattavaksi):

#### 🔴 Korkea prioriteetti:

1. **Enter-näppäin chat-kentässä**
   - Ongelma: Enter ei lähetä viestiä, vain lisää rivin
   - Ratkaisu: Muuta Enter lähettämään, Shift+Enter uudelle riville
   - Vaikutus: Molemmat käyttäjät odottivat tätä toimintaa

2. **"Community Feed" vs "Public Feed" -terminologia**
   - Ongelma: Matti ei ymmärtänyt "Community Feed" = ryhmäpostaus
   - Ratkaisu: Käytä selkeämpiä termejä: "Jaettu ryhmässä" tai "Ryhmäpostaus"
   - Vaikutus: Aiheutti virheen ensimmäisessä yrityksessä

#### 🟡 Keskiprioriteetti:

3. **Activity-lista ryhmän luomisessa**
   - Ongelma: 13+ vaihtoehtoa ilman hakua tai suodatinta
   - Ratkaisu: Lisää hakukenttä tai näytä suositut valinnat ylhäällä
   - Vaikutus: Hidasti 40v käyttäjää merkittävästi

4. **Emoji-picker puuttuu**
   - Ongelma: Painike on olemassa, mutta toiminto ei toimi
   - Ratkaisu: Implementoi emoji-valitsin (esim. `emoji-picker-react` kirjasto on jo käytössä)
   - Vaikutus: Molemmat käyttäjät olisivat halunneet käyttää

#### 🟢 Matala prioriteetti:

5. **Chat-toiminnon nimeäminen**
   - Ongelma: Matti etsi hetken "Messages" tai "Conversations" -termiä
   - Ratkaisu: Harkitse "Messages" tai säilytä "Chats" mutta lisää ikoni selkeyttämään
   - Vaikutus: Pieni viive navigoinnissa

6. **Ryhmävalinta-validointi**
   - Ongelma: Virhe tulee vasta lähetysvaiheessa
   - Ratkaisu: Näytä "Required" -merkintä tai estä lähetys ennen valintaa
   - Vaikutus: Paransi 40v käyttäjän kokemusta

### Vahvuudet:

✅ **Selkeä visuaalinen suunnittelu**

- Sage-väriteema on rauhoittava ja sopii hyvinvointisovellukseen
- Ikonit (Lucide React) ovat selkeitä ja helppolukuisia

✅ **Ryhmän luomisen success-viesti**

- "Check your profile" -ohje auttaa käyttäjiä löytämään juuri luomansa ryhmän

✅ **Real-time -ominaisuudet**

- Typing-indikaattori ja WebSocket-viestit toimivat hyvin
- Lukemattomat viestit näkyvät selkeästi badge-merkeillä

✅ **Responsiivinen layout**

- Sovellus toimi hyvin sekä työpöydällä että mobiililla

### Suositukset kehitykselle:

#### Lyhyen aikavälin toimenpiteet (1-2 viikkoa):

1. 🔧 Muuta Enter-näppäimen toimintaa chatissa
2. 🔧 Korjaa "Community Feed" -terminologia
3. 🔧 Implementoi emoji-picker täysin

#### Keskipitkän aikavälin toimenpiteet (1 kuukausi):

4. 🔧 Lisää hakutoiminto Activity-listaan
5. 🔧 Paranna ryhmävalinta-validointia ShareModalissa
6. 🔧 Lisää keyboard shortcuts -ohje chat-näkymään

#### Pitkän aikavälin parannukset:

7. 🔧 Harkitse wizard-tyylistä lomaketta ryhmän luomiseen (jakaminen vaiheisiin)
8. 🔧 Lisää oletuskuvia ryhmille
9. 🔧 A/B-testaa eri navigaatiomalleja (Chats vs Messages)

---

## Johtopäätökset

Wellbeing App on kaiken kaikkiaan **hyvin suunniteltu sovellus** selkeällä käyttöliittymällä ja toimivilla ydintoiminnoilla. Molemmat käyttäjät pystyivät suorittamaan kaikki tehtävät onnistuneesti, vaikka **iän ja teknologiaosaamisen erot** vaikuttivat suoritusaikaan ja käyttökokemukseen.

**40-vuotias Matti** kohtasi enemmän haasteita terminologian ja implisiittisten toimintojen kanssa, kun taas **24-vuotias Emma** navigoi sovellusta intuitiivisemmin mutta odotti moderneja toimintoja (kuten Enter-lähetys chatissa).

**Suositus:** Priorisoidaan korkeimman prioriteetin ongelmat (Enter-näppäin ja terminologia), sillä ne vaikuttavat molempiin käyttäjäryhmiin ja parantavat merkittävästi käyttökokemusta.

---

**Testauksen suoritti:** AI-avusteinen käytettävyysanalyysi  
**Päiväys:** 28. huhtikuu 2026  
**Sovelluksen versio:** Wellbeing App v1.0 (Development Build)
