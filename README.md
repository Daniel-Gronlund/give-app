# Kvitto — Firebase-driven starter

En fristående version av Kvitto-prototypen, kopplad till ett riktigt Firebase-projekt:
inloggning med **e-post, Google och Apple**, och objekt som **sparas i Firestore**
(bilder i Firebase Storage).

Det här är ett vanligt npm-projekt (Vite + React) — inte en Claude-artefakt — så du
kör det lokalt med Node.js installerat, och kan sedan deploya det (t.ex. till
Firebase Hosting, Vercel eller Netlify).

## 1. Skapa Firebase-projektet

1. Gå till [console.firebase.google.com](https://console.firebase.google.com) och skapa ett nytt projekt (eller använd ett befintligt).
2. **Lägg till en webbapp:** Project settings (kugghjulet) → scrolla till "Your apps" → klicka webb-ikonen `</>` → registrera appen. Du får då ett config-objekt med `apiKey`, `authDomain` osv. — spara det, du behöver det i steg 4.

## 2. Aktivera inloggningsmetoderna

Gå till **Authentication → Sign-in method** och aktivera:

- **E-post/lösenord** — klicka "Email/Password" → Enable → Save.
- **Google** — klicka "Google" → Enable → välj en supportmail → Save. Fungerar direkt, inget mer krävs.
- **Apple** — klicka "Apple" → Enable. Detta kräver dessutom:
  1. Ett [Apple Developer-konto](https://developer.apple.com) (betalt, ca 99 USD/år).
  2. Ett **Services ID** skapat i Apple Developer-portalen, med "Sign in with Apple" aktiverat och Firebase's redirect-URL (visas i Firebase-rutan) inlagd som "Return URL".
  3. En privat nyckel (.p8-fil) + Team ID + Key ID från Apple, som du klistrar in i Firebase-rutan för Apple-providern.

  Om du vill komma igång snabbt kan du hoppa över Apple till en början och bara aktivera Google + e-post — appen fungerar fint utan Apple-knappen synlig (den visas men ger ett tydligt felmeddelande tills providern är aktiverad).

## 3. Skapa databasen och lagringen

- **Firestore:** gå till **Firestore Database → Create database**. Välj "Start in production mode" (säkerhetsreglerna i `firestore.rules` sköter åtkomsten).
- **Storage:** gå till **Storage → Get started**. Samma sak, produktionsläge (regler finns i `storage.rules`).

## 4. Koppla appen till ditt projekt

```bash
cp .env.example .env.local
```

Öppna `.env.local` och klistra in värdena från config-objektet du sparade i steg 1:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 5. Installera och kör

```bash
npm install
npm run dev
```

Öppna länken som visas (oftast `http://localhost:5173`). Registrera ett konto eller
logga in med Google, och testa att lägga upp ett objekt — det ska nu synas i
Firestore Database-fliken i Firebase Console direkt.

## 6. Deploya säkerhetsreglerna

Reglerna i `firestore.rules` och `storage.rules` måste laddas upp till Firebase
för att gälla på riktigt (annars används Firebase's standardregler, som blockerar allt):

```bash
npm install -g firebase-tools
firebase login
firebase init   # välj ditt befintliga projekt, hoppa över filer som redan finns
firebase deploy --only firestore:rules,storage:rules
```

## 7. Deploya själva appen (valfritt)

**Firebase Hosting:**
```bash
npm run build
firebase deploy --only hosting
```

**Eller Netlify/Vercel:** koppla GitHub-repot, sätt byggkommando `npm run build`
och publiceringsmapp `dist`, och lägg in samma miljövariabler som i `.env.local`
under projektets inställningar där.

## Vad som är byggt än så länge

- ✅ Inloggning: e-post/lösenord, Google, Apple
- ✅ Skapa och spara objekt (med bild, blockerade datum) i Firestore/Storage
- ✅ Bläddra bland alla objekt, se ett enskilt objekt med tillgänglighetskalender
- ✅ Bokning: välj datum/tid via kalendern, sparas i Firestore
- ✅ Överlämning/återlämning bekräftas med QR-kod (simulerad skanning) eller Mobilt BankID (simulerad signering) — status och tidsstämplar sparas i Firestore
- ✅ "Min sida" med både "Mina bokningar" och "Mina annonser"
- ✅ Landningssida per objekt (instruktioner, checklista, kontaktinfo) som en valfri knapp per objekt
- ✅ Chatt: "Kontakta ägaren" på ett objekts sida öppnar ett meddelandeflöde i realtid (Firestore), samlat under meddelande-ikonen i headern

## Bra att veta

- **Mobilt BankID är simulerat** i den här versionen — det finns ingen riktig BankID-integration (det kräver ett betalt avtal med Bankgirot/Finansiell ID-Teknik och ett godkänt användningsfall). QR-kods- och BankID-knapparna visar samma flöde och sparar samma typ av bekräftelse i Firestore, men inget riktigt handslag med BankID sker.
- Firestore-reglerna (`firestore.rules`) begränsar vem som får skapa/läsa/ändra bokningar och objekt — se till att deploya dem (steg 6) innan du litar på att data är skyddad.

