# Article Registration

Article Registration er en enkel webapplikation til registrering af egne artikler, reservedele, værktøj og forbrugsvarer.

Projektet er lavet med fokus på princippet **Keep it simple**.  
Formålet er ikke at lave et tungt lager- eller økonomisystem, men derimod et praktisk og hurtigt opslagssystem, hvor man kan:

- søge i alle sine artikler
- undgå at købe noget, man allerede har
- registrere både almindelige artikler og lagerartikler
- markere lagerartikler som tomme
- tilføje dem til en indkøbsliste
- opdatere beholdning hurtigt, når varen er købt og lagt på plads igen

Systemet er tænkt som en personlig og struktureret artikelbase til eksempelvis:

- IT-udstyr
- homelab-komponenter
- kabler og netværksdele
- værktøj
- autoartikler
- el- og VVS-artikler
- andre praktiske lager- og brugsartikler

---

## Projektets idé

Mange har god fysisk struktur på deres ting og ved ofte nogenlunde, hvor tingene ligger.  
Problemet er i stedet, at man over tid får samlet så mange artikler, reservedele og forbrugsvarer sammen, at man mister overblikket over, **hvad man allerede har**.

Article Registration er bygget for at løse netop det problem.

Applikationen fungerer som en slags personlig, søgbar artikeloversigt med filtrering og en enkel indkøbsliste til genbestilling af lagerartikler.

### Eksempler

**Almindelig artikel**

- Renault Kajar alufælge
- HP rackserver
- multimeter
- skraldenøglesæt

**Lagerartikel**

- motorolie 5W-30
- RJ45 stik CAT6
- netværkskabel på rulle
- sikringer
- el-tape
- VVS fittings

---

## V1-funktioner

Løsningen er bevidst holdt enkel i første version.

### Understøttet i V1

- søgning i artikler
- filtrering på relevante felter
- områder og tags
- almindelige artikler
- lagerartikler med beholdning
- indkøbsliste
- hurtig opdatering af beholdning fra indkøbslisten
- mørkt, lyst og systemtema
- Docker-baseret lokal kørsel

### Bevidst ikke med i V1

- økonomi og priser
- leverandørstyring
- avanceret lagerhistorik
- flere lagerlokationer
- dybt lokationshierarki
- automatisk bestilling
- tung enterprise-funktionalitet

---

## Domænemodel i korte træk

Systemet bygger på en enkel model med få centrale begreber.

### Artikel

En artikel er det objekt, der registreres i systemet.

En artikel kan eksempelvis have:

- navn
- artikeltype
- område
- tags
- note/beskrivelse
- mærke/producent
- model/variant
- enhed
- beholdning
- indkøbsnote
- aktiv/arkiveret

### Artikeltyper

Der arbejdes med to hovedtyper:

- **Almindelig artikel**  
  Bruges til ting, man ejer, men som normalt ikke forbruges.

- **Lagerartikel**  
  Bruges til ting, man typisk har et antal af, og som kan løbe tør og skulle genbestilles.

### Områder

Områder bruges som en enkel overordnet gruppering.

Eksempler:

- IT
- Garage
- Værksted
- Auto
- El
- VVS

### Tags

Tags bruges fleksibelt på tværs af områder for at gøre søgning og filtrering stærkere.

Eksempler:

- netværk
- kabel
- server
- homelab
- olie
- reservedel
- forbrug
- værktøj

### Indkøbsliste

Indkøbslisten er ikke et separat avanceret indkøbssystem.  
Den er en praktisk huskeliste, baseret på artiklerne.

Når en lagerartikel løber tør, kan den markeres til indkøbslisten.  
Når varen modtages igen, kan beholdningen opdateres direkte fra indkøbslisten, hvorefter artiklen automatisk kan fjernes fra listen.

---

## Teknisk arkitektur

Løsningen er opdelt i to hoveddele:

### Frontend

- React
- TypeScript
- Vite
- serveres via Nginx i Docker

Frontend er bygget som en moderne, hurtig og mobilvenlig webapp med fokus på:

- search-first brugeroplevelse
- enkel oprettelse og redigering
- filtre
- indkøbsliste
- dark mode / light mode / system theme

### Backend

- .NET 10 Web API
- Entity Framework Core
- SQLite
- Swagger

Backend håndterer:

- artikler
- områder
- tags
- lagerlogik
- indkøbsliste-flow
- filtrering og søgning
- persistence i SQLite

### Database

- SQLite bruges som database i V1
- enkel opsætning
- lav kompleksitet
- velegnet til en mindre, personlig eller intern løsning

---

## Projektstruktur

Projektet er opdelt i to hovedmapper:

- `frontend`
- `backend`

Derudover findes Docker-relaterede filer i roden.

Eksempelvis:

```text
/
├── frontend
├── backend
├── docker-compose.yml
└── README.md
