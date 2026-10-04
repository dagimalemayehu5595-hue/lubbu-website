# TODO before going live

## Photos to request from the client

These service images came from the old website and are smaller than ideal for the 4:3 cards (they look slightly soft on high-resolution phones). Ask the client for the original photos:

| File | Current size | Usable 4:3 area | Note |
|---|---|---|---|
| `assets/services/preventive-care.jpg` | 882×433 | 577×433 | Lowest resolution; wide photo, cropped heavily |
| `assets/services/hi-tech-nicu.jpg` | 829×501 | 668×501 | Same room as `neonatal-icu.jpg`; a different NICU photo would add variety |
| `assets/services/outpatient-care.jpg` | 1280×576 | 768×576 | Wide photo, sides cropped |
| `assets/services/inpatient-care.jpg` | 1280×585 | 780×585 | Wide photo, sides cropped |
| `assets/services/labor-delivery.jpg` | 1200×841 | 1121×841 | Large enough, but it's an upscaled slide graphic with a green corner shape and looks blurry |

## Doctor photos

13 doctors show initials because the old site had no real photos of them: Tigist Sileshi, Demu Tesfaye, Lalise Gemachu, Limi Basha, Dereje Melka, Etenesh Tewelde, Alexander Napoleon, Taye Jemberu, Tewodros Yalew, Muna Abera, Bemnet Alemu, Kaleb Getaneh, Habtamu Tamiru.

To add one: save a square photo as `assets/doctors/first-last.jpg`, then set that path in the doctor's `data-photo=""` attribute in `doctors.html` (and `index.html` if they're featured there).

## Other

- Booking form only opens the visitor's email app. Connect it to a backend (Formspree, Google Sheets, Telegram bot) if requests should be stored.
- Confirm the Sunday hours ("Emergency only") with the client.
- The shared header and footer are copied into all 9 pages between `<!-- SHARED -->` comments. Edit them in every page if they change.
